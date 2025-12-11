# backend/app/main.py
import os
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import competitors, times
from .database import Base, engine, SessionLocal
from .models import Competitor, TimeEntry


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Körs vid uppstart
    # Lägg till temporär testdata, om databasen är tom.
    # Bra under utveckling/testining, men ta bort i produktion!
    # EDIT: Detta kan nog styras via en ENV-variabel senare, för att
    # skilja på dev/prod. Vi vill ju inte att testdata skickas med i
    # produktion eller release builds.
    db = SessionLocal()
    if db.query(Competitor).count() == 0:
        comp1 = Competitor(start_number="123", name="Alice")
        comp2 = Competitor(start_number="456", name="Bob")
        db.add_all([comp1, comp2])
        db.commit()

        db.refresh(comp1)
        db.refresh(comp2)

        db.add_all(
            [
                TimeEntry(
                    competitor_id=comp1.id, timestamp=datetime(2025, 6, 27, 12, 31, 39)
                ),
                TimeEntry(
                    competitor_id=comp2.id, timestamp=datetime(2025, 6, 27, 12, 32, 15)
                ),
                TimeEntry(
                    competitor_id=comp2.id, timestamp=datetime(2025, 6, 27, 12, 47, 38)
                ),
                TimeEntry(
                    competitor_id=comp1.id, timestamp=datetime(2025, 6, 27, 12, 52, 5)
                ),
            ]
        )
        db.commit()
    db.close()

    yield  # startup done


# Skapa databastabeller om de inte redan finns.
Base.metadata.create_all(bind=engine)

# Skapa FastAPI appen
app = FastAPI(lifespan=lifespan, title="Race Timing Backend API")

# Inkludera routrar. Smidigt att dela upp i flera filer.
app.include_router(competitors.router)
app.include_router(times.router)

# 'Mounta' frontend dist mappen (efter build)
if os.path.exists("../frontend/dist"):
    print("Mounting static files from ../frontend/dist")
    app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
else:
    print("No frontend dist folder found, not serving static files.")
    print(
        "Make sure to build the frontend with 'npm run build' in the frontend directory."
    )

# Sätt på CORS för dev om frontend körs separat
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Tillåter att starta appen med "python -m app.main"
# istället för att alltid använda "uvicorn app.main:app --reload"
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
