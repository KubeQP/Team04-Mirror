# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud
from ..database import get_db
from ..schemas import (
    TimeEntryOut,
    RecordTimeIn,
)

router = APIRouter(prefix="/times", tags=["times"])


@router.get("/", response_model=list[TimeEntryOut])
def read_times(db: Session = Depends(get_db)):
    """Hämta alla tidsregistreringar."""
    return crud.get_times(db)


@router.get("/{start_number}", response_model=list[TimeEntryOut])
def read_times_for_competitor(start_number: str, db: Session = Depends(get_db)):
    """Hämta tidsregistreringar för en specifik tävlande baserat på startnummer."""
    times = crud.get_times_by_start_number(db, start_number)
    return times


@router.post("/record", response_model=TimeEntryOut)
def record_time(data: RecordTimeIn, db: Session = Depends(get_db)):
    """Posta en ny tidsregistrering för en tävlande med angivet startnummer."""
    entry = crud.record_time_for_start_number(db, data.start_number)
    if entry is None:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return entry
