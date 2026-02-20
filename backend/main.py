from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import os
import asyncio
from utils.ai_interview import ask_ai_question

app = FastAPI()

# ------------------------
# CORS Configuration
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ------------------------
# Data Models
# ------------------------
class User(BaseModel):
    email: str
    password: str
    type: str
    name: Optional[str] = ""

class Job(BaseModel):
    title: str
    description: str
    requirements: List[str]
    location: str
    salary: Optional[str] = ""
    tags: List[str] = []
    company_email: str
    experience_level: Optional[str] = "Mid-level"

class Application(BaseModel):
    job_id: str
    candidate_email: str
    cover_letter: Optional[str] = ""
    status: str = "applied"

class Profile(BaseModel):
    email: str
    name: str
    skills: List[str]
    experience: str
    education: str
    bio: Optional[str] = ""
    resume_url: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""

class InterviewQuestion(BaseModel):
    job_role: str
    answer: Optional[str] = ""

class Notification(BaseModel):
    user_email: str
    user_type: str
    message: str
    type: str = "info"
    read: bool = False
    data: Optional[Dict] = None

class StatusUpdate(BaseModel):
    application_id: str
    status: str
    message: Optional[str] = ""
    updated_by: str

class InterviewCreate(BaseModel):
    candidate_email: str
    job_id: str
    application_id: str
    score: float
    max_score: float
    percentage: float
    performance: str
    answers: List[Dict[str, Any]]
    time_taken: int

# ------------------------
# WebSocket Connection Manager
# ------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_email: str):
        await websocket.accept()
        self.active_connections[user_email] = websocket
    
    def disconnect(self, user_email: str):
        if user_email in self.active_connections:
            del self.active_connections[user_email]
    
    async def send_personal_message(self, message: str, user_email: str):
        if user_email in self.active_connections:
            try:
                await self.active_connections[user_email].send_text(message)
            except:
                self.disconnect(user_email)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# ------------------------
# Data Folder & Helper Functions
# ------------------------
DATA_FOLDER = "models"
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)

def read_json_file(filename):
    """Safely read JSON file"""
    filepath = f"{DATA_FOLDER}/{filename}"
    
    if not os.path.exists(filepath):
        return []
    
    try:
        with open(filepath, "r") as f:
            content = f.read().strip()
            if not content:
                return []
            data = json.loads(content)
            if isinstance(data, list):
                return data
            else:
                return [data]
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {filepath}")
        with open(filepath, "w") as f:
            json.dump([], f)
        return []
    except Exception as e:
        print(f"Error reading file {filepath}: {str(e)}")
        return []

def write_json_file(filename, data):
    """Safely write JSON file"""
    filepath = f"{DATA_FOLDER}/{filename}"
    
    try:
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error writing file {filepath}: {str(e)}")
        return False

def get_next_id(filename):
    """Get next ID for new entry"""
    data = read_json_file(filename)
    if not data:
        return "1"
    try:
        ids = [int(item.get("id", 0)) for item in data if isinstance(item, dict) and "id" in item]
        return str(max(ids) + 1) if ids else "1"
    except:
        return str(len(data) + 1)

# ------------------------
# WebSocket Endpoint
# ------------------------
@app.websocket("/ws/{user_email}")
async def websocket_endpoint(websocket: WebSocket, user_email: str):
    await manager.connect(websocket, user_email)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_email)

# ------------------------
# AUTH ENDPOINTS
# ------------------------
@app.post("/signup")
async def signup(user: User):
    """Register new user"""
    try:
        user_type = user.type.lower()
        if user_type not in ["company", "candidate"]:
            raise HTTPException(status_code=400, detail="Invalid user type")
        
        if not user.email or not user.password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        if not user.name:
            user.name = user.email.split('@')[0]
        
        users = read_json_file(f"{user_type}.json")
        
        for existing_user in users:
            if existing_user.get("email") == user.email:
                raise HTTPException(status_code=400, detail="Email already exists")
        
        user_dict = user.dict()
        users.append(user_dict)
        
        if write_json_file(f"{user_type}.json", users):
            return {
                "message": "User registered successfully",
                "user": {
                    "email": user.email,
                    "type": user_type,
                    "name": user.name
                }
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save user")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/login")
async def login(user: User):
    """Login user"""
    try:
        user_type = user.type.lower()
        if user_type not in ["company", "candidate"]:
            raise HTTPException(status_code=400, detail="Invalid user type")
        
        if not user.email or not user.password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        users = read_json_file(f"{user_type}.json")
        
        for existing_user in users:
            if (existing_user.get("email") == user.email and 
                existing_user.get("password") == user.password):
                return {
                    "message": "Login successful",
                    "user": {
                        "email": existing_user["email"],
                        "type": user_type,
                        "name": existing_user.get("name", existing_user["email"].split('@')[0])
                    }
                }
        
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ------------------------
# NOTIFICATION ENDPOINTS
# ------------------------
@app.post("/notifications")
async def create_notification(notification: Notification):
    """Create a new notification"""
    try:
        notifications = read_json_file("notifications.json")
        
        notification_dict = notification.dict()
        notification_dict["id"] = get_next_id("notifications.json")
        notification_dict["created_at"] = datetime.now().isoformat()
        notification_dict["read"] = False
        
        notifications.append(notification_dict)
        write_json_file("notifications.json", notifications)
        
        await manager.send_personal_message(
            json.dumps({
                "type": "notification",
                "data": notification_dict
            }),
            notification.user_email
        )
        
        return {"message": "Notification created", "notification": notification_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notifications/{user_email}")
async def get_user_notifications(user_email: str, unread_only: bool = False):
    """Get notifications for a user"""
    try:
        notifications = read_json_file("notifications.json")
        user_notifications = [
            n for n in notifications 
            if n.get("user_email") == user_email
        ]
        
        if unread_only:
            user_notifications = [n for n in user_notifications if not n.get("read")]
        
        user_notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {"notifications": user_notifications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read"""
    try:
        notifications = read_json_file("notifications.json")
        
        for notification in notifications:
            if notification.get("id") == notification_id:
                notification["read"] = True
                notification["read_at"] = datetime.now().isoformat()
                break
        
        write_json_file("notifications.json", notifications)
        return {"message": "Notification marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/notifications/user/{user_email}/read-all")
async def mark_all_notifications_read(user_email: str):
    """Mark all notifications as read for a user"""
    try:
        notifications = read_json_file("notifications.json")
        
        for notification in notifications:
            if notification.get("user_email") == user_email:
                notification["read"] = True
                notification["read_at"] = datetime.now().isoformat()
        
        write_json_file("notifications.json", notifications)
        return {"message": "All notifications marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notifications/{user_email}/unread-count")
async def get_unread_notification_count(user_email: str):
    """Get count of unread notifications"""
    try:
        notifications = read_json_file("notifications.json")
        unread_count = len([
            n for n in notifications 
            if n.get("user_email") == user_email and not n.get("read")
        ])
        return {"unread_count": unread_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------
# AI INTERVIEW ENDPOINT
# ------------------------
@app.post("/interview")
async def interview(question: InterviewQuestion):
    """Get AI interview question"""
    try:
        if not question.job_role:
            raise HTTPException(status_code=400, detail="Job role is required")
        
        ai_question = ask_ai_question(question.job_role, question.answer)
        
        return {"question": ai_question}
        
    except Exception as e:
        print(f"Interview error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service error")

# ------------------------
# INTERVIEW SYSTEM ENDPOINTS
# ------------------------
@app.post("/interviews/save")
async def save_interview_results(interview_data: InterviewCreate):
    """Save interview results"""
    try:
        # Check if application exists
        applications = read_json_file("applications.json")
        application = None
        for app in applications:
            if app.get("id") == interview_data.application_id:
                application = app
                break
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Read existing interviews
        interviews = read_json_file("interviews.json")
        
        # Create new interview record
        interview_dict = interview_data.dict()
        interview_dict["id"] = get_next_id("interviews.json")
        interview_dict["completed_at"] = datetime.now().isoformat()
        
        interviews.append(interview_dict)
        
        # Save interviews
        write_json_file("interviews.json", interviews)
        
        # Update application status and score
        for app in applications:
            if app.get("id") == interview_data.application_id:
                app["status"] = "interview_completed"
                app["interview_score"] = interview_data.percentage
                app["status_updated_at"] = datetime.now().isoformat()
                app["status_updated_by"] = "system"
                break
        
        write_json_file("applications.json", applications)
        
        # Notify company about interview completion
        jobs = read_json_file("jobs.json")
        job = next((j for j in jobs if j.get("id") == interview_data.job_id), {})
        
        notification = Notification(
            user_email=job.get("company_email", ""),
            user_type="company",
            message=f"Interview completed for candidate: {interview_data.candidate_email}",
            type="info",
            data={
                "application_id": interview_data.application_id,
                "candidate_email": interview_data.candidate_email,
                "job_id": interview_data.job_id,
                "score": interview_data.percentage,
                "performance": interview_data.performance
            }
        )
        await create_notification(notification)
        
        # Also notify candidate
        candidate_notification = Notification(
            user_email=interview_data.candidate_email,
            user_type="candidate",
            message=f"Your interview for {job.get('title', 'job')} has been completed. Score: {interview_data.percentage}%",
            type="info",
            data={
                "application_id": interview_data.application_id,
                "job_id": interview_data.job_id,
                "score": interview_data.percentage,
                "performance": interview_data.performance
            }
        )
        await create_notification(candidate_notification)
        
        return {
            "success": True,
            "message": "Interview results saved successfully",
            "interview": interview_dict
        }
        
    except Exception as e:
        print(f"Save interview error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save interview results")

@app.get("/interviews/application/{application_id}")
async def get_interviews_by_application(application_id: str):
    """Get interviews for a specific application"""
    try:
        interviews = read_json_file("interviews.json")
        application_interviews = [
            interview for interview in interviews 
            if interview.get("application_id") == application_id
        ]
        
        # Sort by completion date
        application_interviews.sort(key=lambda x: x.get("completed_at", ""), reverse=True)
        
        return {"interviews": application_interviews}
    except Exception as e:
        print(f"Get interviews error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch interviews")

@app.get("/interviews/candidate/{candidate_email}")
async def get_interviews_by_candidate(candidate_email: str):
    """Get all interviews for a candidate"""
    try:
        interviews = read_json_file("interviews.json")
        candidate_interviews = [
            interview for interview in interviews 
            if interview.get("candidate_email") == candidate_email
        ]
        
        # Get job details for each interview
        jobs = read_json_file("jobs.json")
        for interview in candidate_interviews:
            job = next((j for j in jobs if j.get("id") == interview.get("job_id")), {})
            interview["job_title"] = job.get("title", "")
            interview["company_email"] = job.get("company_email", "")
        
        # Sort by completion date
        candidate_interviews.sort(key=lambda x: x.get("completed_at", ""), reverse=True)
        
        return {"interviews": candidate_interviews}
    except Exception as e:
        print(f"Get candidate interviews error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch interviews")

@app.get("/interviews/job/{job_id}")
async def get_interviews_by_job(job_id: str):
    """Get all interviews for a job"""
    try:
        interviews = read_json_file("interviews.json")
        job_interviews = [
            interview for interview in interviews 
            if interview.get("job_id") == job_id
        ]
        
        # Sort by score
        job_interviews.sort(key=lambda x: x.get("percentage", 0), reverse=True)
        
        return {"interviews": job_interviews}
    except Exception as e:
        print(f"Get job interviews error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch interviews")

# ------------------------
# JOB ENDPOINTS
# ------------------------
@app.post("/jobs")
async def create_job(job: Job):
    """Create new job posting with notifications"""
    try:
        companies = read_json_file("company.json")
        company_exists = any(c.get("email") == job.company_email for c in companies)
        if not company_exists:
            raise HTTPException(status_code=400, detail="Company not found")
        
        jobs = read_json_file("jobs.json")
        
        job_dict = job.dict()
        job_dict["id"] = get_next_id("jobs.json")
        job_dict["created_date"] = datetime.now().isoformat()
        job_dict["status"] = "open"
        job_dict["company_name"] = job.company_email.split('@')[0]
        
        jobs.append(job_dict)
        
        if write_json_file("jobs.json", jobs):
            # Notify matched candidates
            profiles = read_json_file("profiles.json")
            for profile in profiles:
                candidate_skills = set([s.lower() for s in profile.get("skills", [])])
                job_skills = set([s.lower() for s in job.tags + 
                                 " ".join(job.requirements).lower().split()])
                
                if candidate_skills.intersection(job_skills):
                    notification = Notification(
                        user_email=profile.get("email"),
                        user_type="candidate",
                        message=f"New job matches your skills: {job.title}",
                        type="info",
                        data={
                            "job_id": job_dict["id"],
                            "job_title": job.title,
                            "company": job.company_email,
                            "match_reason": "Your skills match this job"
                        }
                    )
                    await create_notification(notification)
            
            return {
                "message": "Job created successfully",
                "job": job_dict,
                "notifications_sent": True
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save job")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create job error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/jobs")
async def get_all_jobs():
    """Get all jobs"""
    try:
        jobs = read_json_file("jobs.json")
        return {"jobs": jobs}
    except Exception as e:
        print(f"Get jobs error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/jobs/{job_id}")
async def get_job(job_id: str):
    """Get specific job by ID"""
    try:
        jobs = read_json_file("jobs.json")
        for job in jobs:
            if job.get("id") == job_id:
                return {"job": job}
        raise HTTPException(status_code=404, detail="Job not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get job error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/jobs/company/{email}")
async def get_company_jobs(email: str):
    """Get all jobs by company"""
    try:
        jobs = read_json_file("jobs.json")
        company_jobs = [job for job in jobs if job.get("company_email") == email]
        return {"jobs": company_jobs}
    except Exception as e:
        print(f"Get company jobs error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete job"""
    try:
        jobs = read_json_file("jobs.json")
        
        job_index = -1
        for i, job in enumerate(jobs):
            if job.get("id") == job_id:
                job_index = i
                break
        
        if job_index == -1:
            raise HTTPException(status_code=404, detail="Job not found")
        
        deleted_job = jobs.pop(job_index)
        
        if write_json_file("jobs.json", jobs):
            return {"message": "Job deleted successfully", "job": deleted_job}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete job")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete job error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ------------------------
# APPLICATION ENDPOINTS
# ------------------------
@app.post("/apply")
async def apply_job(application: Application):
    """Apply for a job with notification"""
    try:
        candidates = read_json_file("candidate.json")
        candidate_exists = any(c.get("email") == application.candidate_email for c in candidates)
        if not candidate_exists:
            raise HTTPException(status_code=400, detail="Candidate not found")
        
        jobs = read_json_file("jobs.json")
        job_exists = any(j.get("id") == application.job_id for j in jobs)
        if not job_exists:
            raise HTTPException(status_code=400, detail="Job not found")
        
        applications = read_json_file("applications.json")
        existing_application = next(
            (app for app in applications 
             if app.get("job_id") == application.job_id and 
                app.get("candidate_email") == application.candidate_email),
            None
        )
        if existing_application:
            raise HTTPException(status_code=400, detail="Already applied for this job")
        
        job = next((j for j in jobs if j.get("id") == application.job_id), {})
        
        app_dict = application.dict()
        app_dict["id"] = get_next_id("applications.json")
        app_dict["applied_date"] = datetime.now().isoformat()
        
        applications.append(app_dict)
        
        if write_json_file("applications.json", applications):
            # Notify company
            notification = Notification(
                user_email=job.get("company_email"),
                user_type="company",
                message=f"New application received for {job.get('title')}",
                type="info",
                data={
                    "application_id": app_dict["id"],
                    "job_id": application.job_id,
                    "job_title": job.get("title"),
                    "candidate_email": application.candidate_email
                }
            )
            await create_notification(notification)
            
            return {"message": "Application submitted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to submit application")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Apply job error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/applications/candidate/{email}")
async def get_candidate_applications(email: str):
    """Get all applications by candidate"""
    try:
        applications = read_json_file("applications.json")
        candidate_apps = [app for app in applications if app.get("candidate_email") == email]
        
        jobs = read_json_file("jobs.json")
        for app in candidate_apps:
            job = next((j for j in jobs if j.get("id") == app.get("job_id")), {})
            app["job_details"] = job
        
        # Get interview scores for each application
        interviews = read_json_file("interviews.json")
        for app in candidate_apps:
            app_interviews = [i for i in interviews if i.get("application_id") == app.get("id")]
            if app_interviews:
                latest_interview = sorted(app_interviews, key=lambda x: x.get("completed_at", ""), reverse=True)[0]
                app["latest_interview"] = {
                    "score": latest_interview.get("score"),
                    "max_score": latest_interview.get("max_score"),
                    "percentage": latest_interview.get("percentage"),
                    "performance": latest_interview.get("performance"),
                    "completed_at": latest_interview.get("completed_at")
                }
        
        return {"applications": candidate_apps}
    except Exception as e:
        print(f"Get candidate applications error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/applications/job/{job_id}")
async def get_job_applications(job_id: str):
    """Get all applications for a job"""
    try:
        applications = read_json_file("applications.json")
        job_apps = [app for app in applications if app.get("job_id") == job_id]
        
        profiles = read_json_file("profiles.json")
        for app in job_apps:
            profile = next((p for p in profiles if p.get("email") == app.get("candidate_email")), {})
            app["candidate_profile"] = profile
        
        # Get interview scores for each application
        interviews = read_json_file("interviews.json")
        for app in job_apps:
            app_interviews = [i for i in interviews if i.get("application_id") == app.get("id")]
            if app_interviews:
                latest_interview = sorted(app_interviews, key=lambda x: x.get("completed_at", ""), reverse=True)[0]
                app["latest_interview"] = {
                    "score": latest_interview.get("score"),
                    "max_score": latest_interview.get("max_score"),
                    "percentage": latest_interview.get("percentage"),
                    "performance": latest_interview.get("performance"),
                    "completed_at": latest_interview.get("completed_at")
                }
        
        return {"applications": job_apps}
    except Exception as e:
        print(f"Get job applications error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.put("/applications/{app_id}/status")
async def update_application_status(app_id: str, status_update: StatusUpdate):
    """Update application status and notify candidate"""
    try:
        applications = read_json_file("applications.json")
        
        application = None
        for app in applications:
            if app.get("id") == app_id:
                application = app
                break
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        old_status = application.get("status", "applied")
        application["status"] = status_update.status
        application["status_updated_at"] = datetime.now().isoformat()
        application["status_updated_by"] = status_update.updated_by
        application["status_message"] = status_update.message
        
        write_json_file("applications.json", applications)
        
        job = None
        jobs = read_json_file("jobs.json")
        for j in jobs:
            if j.get("id") == application.get("job_id"):
                job = j
                break
        
        notification_message = f"Your application for {job.get('title', 'a job')} status updated to '{status_update.status}'"
        if status_update.message:
            notification_message += f": {status_update.message}"
        
        notification = Notification(
            user_email=application.get("candidate_email"),
            user_type="candidate",
            message=notification_message,
            type="info",
            data={
                "application_id": app_id,
                "job_id": application.get("job_id"),
                "job_title": job.get("title", "Unknown Job"),
                "old_status": old_status,
                "new_status": status_update.status,
                "company": status_update.updated_by
            }
        )
        
        await create_notification(notification)
        
        return {
            "message": "Application status updated",
            "application": application
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------
# PROFILE ENDPOINTS
# ------------------------
@app.post("/profile")
async def save_profile(profile: Profile):
    """Save or update candidate profile"""
    try:
        profiles = read_json_file("profiles.json")
        
        profile_index = -1
        for i, p in enumerate(profiles):
            if p.get("email") == profile.email:
                profile_index = i
                break
        
        profile_dict = profile.dict()
        profile_dict["updated_at"] = datetime.now().isoformat()
        
        if profile_index != -1:
            profiles[profile_index] = profile_dict
        else:
            profile_dict["created_at"] = datetime.now().isoformat()
            profiles.append(profile_dict)
        
        if write_json_file("profiles.json", profiles):
            return {"message": "Profile saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save profile")
            
    except Exception as e:
        print(f"Save profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/profile/{email}")
async def get_profile(email: str):
    """Get candidate profile"""
    try:
        profiles = read_json_file("profiles.json")
        
        profile = next((p for p in profiles if p.get("email") == email), None)
        
        if not profile:
            candidates = read_json_file("candidate.json")
            candidate = next((c for c in candidates if c.get("email") == email), {})
            profile = {
                "email": email,
                "name": candidate.get("name", email.split('@')[0]),
                "skills": [],
                "experience": "",
                "education": "",
                "bio": "",
                "resume_url": "",
                "phone": "",
                "location": ""
            }
        
        return {"profile": profile}
    except Exception as e:
        print(f"Get profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/profile/company-view/{candidate_email}")
async def get_candidate_profile_for_company(candidate_email: str, company_email: str):
    """Get complete candidate profile for company view"""
    try:
        profile_response = await get_profile(candidate_email)
        profile = profile_response.get("profile", {})
        
        applications = read_json_file("applications.json")
        jobs = read_json_file("jobs.json")
        
        company_applications = []
        for app in applications:
            if app.get("candidate_email") == candidate_email:
                job = next((j for j in jobs if j.get("id") == app.get("job_id")), {})
                if job.get("company_email") == company_email:
                    company_applications.append({
                        **app,
                        "job_title": job.get("title"),
                        "job_location": job.get("location")
                    })
        
        skills = profile.get("skills", [])
        skills_analysis = {
            "total_skills": len(skills),
            "technical_skills": [s for s in skills if any(tech in s.lower() for tech in 
                ["python", "java", "javascript", "react", "node", "sql", "aws", "docker"])],
            "soft_skills": [s for s in skills if any(soft in s.lower() for soft in 
                ["communication", "leadership", "teamwork", "problem", "creative", "management"])],
        }
        
        completeness_score = 0
        if profile.get("name"): completeness_score += 20
        if profile.get("skills"): completeness_score += 20
        if profile.get("experience"): completeness_score += 20
        if profile.get("education"): completeness_score += 20
        if profile.get("bio"): completeness_score += 10
        if profile.get("resume_url"): completeness_score += 10
        
        return {
            "profile": profile,
            "company_applications": company_applications,
            "skills_analysis": skills_analysis,
            "profile_completeness": completeness_score,
            "last_updated": profile.get("updated_at", profile.get("created_at", ""))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------
# JOB MATCHING ENDPOINTS
# ------------------------
@app.get("/match/{email}")
async def get_matched_jobs(email: str):
    """Get jobs matched to candidate's profile"""
    try:
        profile_response = await get_profile(email)
        profile = profile_response.get("profile", {})
        
        candidate_skills = set([skill.lower() for skill in profile.get("skills", [])])
        
        jobs = read_json_file("jobs.json")
        open_jobs = [job for job in jobs if job.get("status") == "open"]
        
        matched_jobs = []
        
        for job in open_jobs:
            job_text = f"{job.get('title', '')} {job.get('description', '')} {' '.join(job.get('requirements', []))} {' '.join(job.get('tags', []))}"
            job_keywords = set([word.lower() for word in job_text.split() if len(word) > 3])
            
            common_skills = candidate_skills.intersection(job_keywords)
            if job_keywords:
                match_score = (len(common_skills) / len(job_keywords)) * 100
            else:
                match_score = 0
            
            if match_score > 0:
                matched_jobs.append({
                    **job,
                    "match_score": round(match_score, 1),
                    "matching_skills": list(common_skills)
                })
        
        matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        
        return {"matched_jobs": matched_jobs[:20]}
        
    except Exception as e:
        print(f"Get matched jobs error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ------------------------
# ANALYTICS ENDPOINTS
# ------------------------
@app.get("/analytics/candidate/{email}")
async def get_candidate_analytics(email: str):
    """Get candidate analytics"""
    try:
        applications = read_json_file("applications.json")
        candidate_apps = [app for app in applications if app.get("candidate_email") == email]
        
        # Get interview count
        interviews = read_json_file("interviews.json")
        interview_count = len([i for i in interviews if i.get("candidate_email") == email])
        
        stats = {
            "total_applications": len(candidate_apps),
            "applied": len([app for app in candidate_apps if app.get("status") == "applied"]),
            "reviewed": len([app for app in candidate_apps if app.get("status") == "reviewed"]),
            "interview_scheduled": len([app for app in candidate_apps if app.get("status") == "interview_scheduled"]),
            "interview_completed": len([app for app in candidate_apps if app.get("status") == "interview_completed"]),
            "accepted": len([app for app in candidate_apps if app.get("status") == "accepted"]),
            "rejected": len([app for app in candidate_apps if app.get("status") == "rejected"]),
            "interview_count": interview_count
        }
        
        recent_apps = sorted(
            candidate_apps,
            key=lambda x: x.get("applied_date", ""),
            reverse=True
        )[:10]
        
        return {
            "statistics": stats,
            "recent_applications": recent_apps
        }
        
    except Exception as e:
        print(f"Get candidate analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/analytics/company/{email}")
async def get_company_analytics(email: str):
    """Get company analytics"""
    try:
        jobs = read_json_file("jobs.json")
        company_jobs = [job for job in jobs if job.get("company_email") == email]
        
        applications = read_json_file("applications.json")
        
        # Get interview stats
        interviews = read_json_file("interviews.json")
        company_interviews = []
        for job in company_jobs:
            job_interviews = [i for i in interviews if i.get("job_id") == job.get("id")]
            company_interviews.extend(job_interviews)
        
        stats = {
            "total_jobs": len(company_jobs),
            "open_jobs": len([job for job in company_jobs if job.get("status") == "open"]),
            "closed_jobs": len([job for job in company_jobs if job.get("status") == "closed"]),
            "total_applications": 0,
            "new_applications": 0,
            "interview_scheduled": 0,
            "interview_completed": 0,
            "hired": 0,
            "total_interviews": len(company_interviews),
            "avg_interview_score": 0
        }
        
        company_applications = []
        for job in company_jobs:
            job_apps = [app for app in applications if app.get("job_id") == job.get("id")]
            stats["total_applications"] += len(job_apps)
            stats["new_applications"] += len([app for app in job_apps if app.get("status") == "applied"])
            stats["interview_scheduled"] += len([app for app in job_apps if app.get("status") == "interview_scheduled"])
            stats["interview_completed"] += len([app for app in job_apps if app.get("status") == "interview_completed"])
            stats["hired"] += len([app for app in job_apps if app.get("status") == "accepted"])
            company_applications.extend(job_apps)
        
        # Calculate average interview score
        if company_interviews:
            total_score = sum([i.get("percentage", 0) for i in company_interviews])
            stats["avg_interview_score"] = round(total_score / len(company_interviews), 1)
        
        recent_apps = sorted(
            company_applications,
            key=lambda x: x.get("applied_date", ""),
            reverse=True
        )[:10]
        
        return {
            "statistics": stats,
            "recent_applications": recent_apps
        }
        
    except Exception as e:
        print(f"Get company analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ------------------------
# ACTIVITIES ENDPOINT
# ------------------------
@app.get("/activities/{user_email}")
async def get_recent_activities(user_email: str, limit: int = 10):
    """Get recent activities for a user"""
    try:
        activities = []
        
        notifications = read_json_file("notifications.json")
        user_notifications = [
            {
                "type": "notification",
                "title": n.get("message"),
                "description": n.get("type"),
                "timestamp": n.get("created_at"),
                "read": n.get("read", False)
            }
            for n in notifications if n.get("user_email") == user_email
        ]
        activities.extend(user_notifications[:limit])
        
        applications = read_json_file("applications.json")
        user_applications = [
            {
                "type": "application_update",
                "title": f"Application status updated",
                "description": f"Status changed to {app.get('status')}",
                "timestamp": app.get("status_updated_at", app.get("applied_date")),
                "data": {
                    "job_id": app.get("job_id"),
                    "status": app.get("status")
                }
            }
            for app in applications if app.get("candidate_email") == user_email
        ]
        activities.extend(user_applications[:limit])
        
        activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return {"activities": activities[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------
# HEALTH & UTILITY ENDPOINTS
# ------------------------
@app.get("/")
async def root():
    return {"message": "AI Interview Platform API", "version": "1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/stats")
async def get_stats():
    """Get platform statistics"""
    try:
        candidates = len(read_json_file("candidate.json"))
        companies = len(read_json_file("company.json"))
        jobs = len(read_json_file("jobs.json"))
        applications = len(read_json_file("applications.json"))
        profiles = len(read_json_file("profiles.json"))
        notifications = len(read_json_file("notifications.json"))
        interviews = len(read_json_file("interviews.json"))
        
        return {
            "candidates": candidates,
            "companies": companies,
            "jobs": jobs,
            "applications": applications,
            "profiles": profiles,
            "notifications": notifications,
            "interviews": interviews
        }
    except Exception as e:
        print(f"Get stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/reset/{data_type}")
async def reset_data(data_type: str):
    """Reset data (for testing only)"""
    try:
        if data_type not in ["candidate", "company", "jobs", "applications", "profiles", "notifications", "interviews", "all"]:
            raise HTTPException(status_code=400, detail="Invalid data type")
        
        if data_type == "all":
            files = ["candidate.json", "company.json", "jobs.json", "applications.json", "profiles.json", "notifications.json", "interviews.json"]
            for file in files:
                write_json_file(file, [])
            return {"message": "All data reset successfully"}
        else:
            write_json_file(f"{data_type}.json", [])
            return {"message": f"{data_type} data reset successfully"}
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset data error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
        