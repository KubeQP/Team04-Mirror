import os
import uvicorn
from dotenv import load_dotenv
from urllib.parse import urlparse
from app.main import app

load_dotenv()

if __name__ == "__main__":
    api_url = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")

    parsed = urlparse(api_url)
    host = parsed.hostname
    port = parsed.port or 8000

    uvicorn.run(app, host=host, port=port, reload=False)