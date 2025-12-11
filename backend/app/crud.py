# backend/app/crud.py

# Kommentar: CRUD står för Create, Read, Update, Delete och innehåller
# funktioner för att interagera med databasen, som anropas från routrar.

from sqlalchemy.orm import Session
from .models import Competitor, TimeEntry


def get_competitors(db: Session):
    """Hämta alla tävlande från databasen."""
    return db.query(Competitor).all()


def get_times(db: Session):
    """Hämta alla tidsregistreringar från databasen."""
    return db.query(TimeEntry).all()


def get_times_by_start_number(db: Session, start_number: str):
    """Hämta tidsregistreringar för en specifik tävlande baserat på startnummer."""
    return (
        db.query(TimeEntry)
        .join(Competitor)
        .filter(Competitor.start_number == start_number)
        .all()
    )


def record_time_for_start_number(db: Session, start_number: str) -> TimeEntry | None:
    """Registrera en ny tid för en tävlande med angivet startnummer."""
    competitor = db.query(Competitor).filter_by(start_number=start_number).first()
    if competitor is None:
        return None  # hanteras i router
    entry = TimeEntry(competitor_id=competitor.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
