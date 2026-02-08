import os
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "DEV")  # "DEV" or "LIVE"

CONFIG = {
    "DEV": {
        "API_BASE_URL": "http://127.0.0.1:8000",
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", "your-openai-key-here")
    },
    "LIVE": {
        "API_BASE_URL": "https://your-live-backend.com",
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY")
    }
}

CURRENT = CONFIG[ENV]
API_BASE_URL = CURRENT["API_BASE_URL"]
OPENAI_API_KEY = CURRENT["OPENAI_API_KEY"]