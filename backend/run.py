# backend/run.py
import os
from urllib.parse import urlparse
from app.main import app


import uvicorn
from dotenv import load_dotenv

# Load .env from same folder as the binary
BASE_DIR = os.path.dirname(__file__)
dotenv_path = os.path.join(BASE_DIR, ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    print(f"No .env found at {dotenv_path}, using defaults.")

# Determine host & port from API_BASE_URL
api_url = os.getenv("API_BASE_URL", "http://127.0.0.1:8004")
parsed = urlparse(api_url)
host = parsed.hostname or "127.0.0.1"
port = parsed.port or 8000

print(f"API_BASE_URL = {api_url}")
print(f"Starting server on {host}:{port}")

# Start Uvicorn
uvicorn.run(app, host="127.0.0.1", port=port, reload=False)
