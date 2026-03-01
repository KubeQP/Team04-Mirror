import os
from urllib.parse import urlparse

import uvicorn
from dotenv import load_dotenv

from app.main import app

load_dotenv()

if __name__ == "__main__":
    api_url = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")

    parsed = urlparse(api_url)
    host = parsed.hostname if parsed.hostname else "127.0.0.1"
    port = parsed.port or 8000

    uvicorn.run("app.main:app", host=host, port=port, reload=False)
