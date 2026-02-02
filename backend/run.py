import uvicorn

from app.main import app

if __name__ == "main":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
