# backend/app/main.py
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from .database import Base, engine
from .routers import competitions, competitors, results, stations, times

# from datetime import datetime
# from sqlalchemy.orm import Session
# from .models import Competition, Competitor, Station, TimeEntry

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    # Base.metadata.create_all(bind=engine)
    #
    # with Session(engine) as db:
    #     if not db.query(Competition).first():
    #         print(
    #             "Seeding database with competition, competitors, stations and times..."
    #         )
    #
    #         # Create competition
    #         competition = Competition(token="c2dd9cc9-1cee-4435-82f1-7283fd0ef883")
    #         db.add(competition)
    #         db.flush()
    #
    #         # Create stations
    #         start_station = Station(
    #             station_name="start",
    #             order="1",
    #             competition_id=competition.id,
    #         )
    #         finish_station = Station(
    #             station_name="mål",
    #             order="2",
    #             competition_id=competition.id,
    #         )
    #
    #         db.add_all([start_station, finish_station])
    #         db.flush()
    #
    #         # Competitors + exact start & finish times
    #         results_data = [
    #             ("013", "Sven Svensson", "13:29:30", "13:33:54"),
    #             ("027", "Miriam Mirakel", "13:29:20", "13:34:09"),
    #             ("026", "Anna Andersson", "13:29:09", "13:34:05"),
    #             ("009", "Pelle Persson", "13:28:59", "13:34:19"),
    #             ("002", "Sixten Stenkast", "13:28:28", "13:34:42"),
    #             ("040", "Lisa Larsson", "13:28:38", "13:34:56"),
    #             ("001", "Kalle Kula", "13:28:49", "13:35:10"),
    #             ("037", "Oskar Oskarsson", "13:28:19", "13:35:09"),
    #             ("005", "Erik Eriksson", "13:28:10", "13:35:37"),
    #             ("008", "Emma Emanuelsson", "13:27:58", "13:35:35"),
    #         ]
    #
    #         for start_number, name, start_time_str, finish_time_str in results_data:
    #             competitor = Competitor(
    #                 start_number=start_number,
    #                 name=name,
    #                 competition_id=competition.id,
    #             )
    #             db.add(competitor)
    #             db.flush()
    #
    #             start_time = datetime.strptime(start_time_str, "%H:%M:%S")
    #             finish_time = datetime.strptime(finish_time_str, "%H:%M:%S")
    #
    #             db.add_all(
    #                 [
    #                     TimeEntry(
    #                         competitor_id=competitor.id,
    #                         station_id=start_station.id,
    #                         timestamp=start_time,
    #                         start_number=start_number,
    #                         competition_id=competition.id,
    #                     ),
    #                     TimeEntry(
    #                         competitor_id=competitor.id,
    #                         station_id=finish_station.id,
    #                         timestamp=finish_time,
    #                         start_number=start_number,
    #                         competition_id=competition.id,
    #                     ),
    #                 ]
    #             )
    #
    #         db.commit()
    #         print("Seeding complete.")
    #
    yield


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
        os.getenv("API_BASE_URL", "http://127.0.0.1:8000"),
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

    api_url = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")

    parsed = urlparse(api_url)
    host = parsed.hostname if parsed.hostname else "127.0.0.1"
    port = parsed.port or 8000

    uvicorn.run("app.main:app", host=host, port=port, reload=True)
