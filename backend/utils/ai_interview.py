import openai
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def ask_ai_question(job_role, candidate_answer=None):
    """
    Generates AI interview questions for a candidate.
    """
    if candidate_answer:
        prompt = f"""
        You are conducting an interview for the role of {job_role}.
        
        The candidate just answered: "{candidate_answer}"
        
        Based on their answer, ask the next appropriate technical or behavioral question.
        
        Keep the question focused, relevant to the role, and challenging but fair.
        Maximum 2 sentences.
        """
    else:
        prompt = f"""
        You are conducting an interview for the role of {job_role}.
        
        Ask the first technical or behavioral question for this role.
        
        Make it relevant, challenging, and something that would help assess the candidate's skills.
        Maximum 2 sentences.
        """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional technical interviewer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )
        return response['choices'][0]['message']['content'].strip()
    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        # Fallback questions
        fallback_questions = {
            "frontend developer": "Can you explain the difference between React's useState and useEffect hooks?",
            "backend developer": "How would you design a RESTful API for a blogging platform?",
            "fullstack developer": "Describe your approach to handling authentication in a web application.",
            "data scientist": "How would you handle missing data in a dataset before training a model?",
            "devops engineer": "Explain the concept of Infrastructure as Code and its benefits.",
            "default": f"For the role of {job_role}, what experience do you have with relevant technologies?"
        }
        
        for key, question in fallback_questions.items():
            if key in job_role.lower():
                return question
        
        return fallback_questions["default"]