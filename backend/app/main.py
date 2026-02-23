# backend/app/main.py
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import datetime
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from .database import Base, SessionLocal, engine
from .models import Competition, Competitor, Station, TimeEntry
from .routers import competitions, competitors, results, stations, times


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Körs vid uppstart
    # Lägg till temporär testdata, om databasen är tom.
    # Bra under utveckling/testining, men ta bort i produktion!
    # EDIT: Detta kan nog styras via en ENV-variabel senare, för att
    # skilja på dev/prod. Vi vill ju inte att testdata skickas med i
    # produktion eller release builds.
    db = SessionLocal()
    if db.query(Competitor).count() == 0:
        competition0 = Competition()
        db.add(competition0)
        db.commit()
        competitors = []
        competitors.append(
            Competitor(start_number="123", name="Alice", competition_id=1)
        )
        competitors.append(Competitor(start_number="458", name="Bob", competition_id=1))

        db.add_all(competitors)
        db.commit()

        for i in competitors:
            db.refresh(i)

        station1 = Station(station_name="start", order="0", competition_id=1)
        station2 = Station(station_name="mål", order="1", competition_id=1)
        db.add_all([station1, station2])
        db.commit()

        db.refresh(station1)
        db.refresh(station2)

        db.add_all(
            [
                # Alice (competitors[0]) – finisher
                TimeEntry(
                    competitor_id=competitors[0].id,
                    timestamp=datetime(2025, 6, 27, 12, 31, 39),
                    station_id=station1.id,
                    competition_id=1,
                ),
                TimeEntry(
                    competitor_id=competitors[1].id,
                    timestamp=datetime(2025, 6, 27, 12, 32, 15),
                    station_id=station1.id,
                    competition_id=1,
                ),
                TimeEntry(
                    competitor_id=competitors[0].id,
                    timestamp=datetime(2025, 6, 27, 12, 47, 38),
                    station_id=station2.id,
                    competition_id=1,
                ),
                TimeEntry(
                    competitor_id=competitors[1].id,
                    timestamp=datetime(2025, 6, 27, 12, 52, 5),
                    station_id=station2.id,
                    competition_id=1,
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
        os.getenv("API_BASE_URL"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Inkludera routrar. Smidigt att dela upp i flera filer.
app.include_router(competitors.router, prefix="/api")
app.include_router(times.router, prefix="/api")
app.include_router(stations.router, prefix="/api")
app.include_router(competitions.router, prefix="/api")
app.include_router(results.router, prefix="/api")

FRONTEND_DIST = "../frontend/dist"

# 'Mounta' frontend dist mappen (efter build)
if os.path.exists(FRONTEND_DIST):
    print(f"Mounting static files from {FRONTEND_DIST}.")

    app.mount(
        "/assets", StaticFiles(directory=f"{FRONTEND_DIST}/assets"), name="assets"
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str) -> FileResponse:
        file_path = os.path.join(FRONTEND_DIST, full_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

else:
    print("No frontend dist folder found, not serving static files.")
    print(
        "Make sure to build the frontend with 'npm run build' in the frontend directory."
    )


# Tillåter att starta appen med "python -m app.main"
# istället för att alltid använda "uvicorn app.main:app --reload"
if __name__ == "__main__":
    import uvicorn

    api_url = os.getenv("API_BASE_URL", "http://127.0.0.1:7000")

    parsed = urlparse(api_url)
    host = parsed.hostname
    port = parsed.port or 8000

    uvicorn.run("app.main:app", host=host, port=port, reload=True)
