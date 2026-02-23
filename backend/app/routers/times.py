# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models import TimeEntry

from .. import crud
from ..database import get_db
from ..schemas import (
    RecordTimeIn,
    TimeEntryOut,
    TimeEntryUpdate,
)

router = APIRouter(prefix="/times", tags=["times"])


@router.get("/", response_model=list[TimeEntryOut])
def read_times(db: Session = Depends(get_db)) -> list[TimeEntry]:
    """Hämta alla tidsregistreringar."""
    return crud.get_times(db)


@router.get("/{start_number}", response_model=list[TimeEntryOut])
def read_times_for_competitor(
    start_number: str, db: Session = Depends(get_db)
) -> list[TimeEntry]:
    """Hämta tidsregistreringar för en specifik tävlande baserat på startnummer."""
    times = crud.get_times_by_start_number(db, start_number)
    return times


@router.post("/record", response_model=TimeEntryOut)
def record_time(data: RecordTimeIn, db: Session = Depends(get_db)) -> TimeEntry:
    """Posta en ny tidsregistrering för en tävlande med angivet startnummer."""
    entry = crud.record_time_for_start_number(
        db, data.start_number, data.timestamp, data.station_id
    )

    return entry


@router.put("/{time_id}/", response_model=TimeEntryOut)
def update_time_entry(
    data: TimeEntryUpdate,
    db: Session = Depends(get_db),
) -> TimeEntry | None:
    entry = crud.update_time_entry(
        db, data.id, data.competitor_id, data.timestamp, data.station_id
    )

    return entry
