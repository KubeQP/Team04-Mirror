# backend/app/crud.py

# Kommentar: CRUD står för Create, Read, Update, Delete och innehåller
# funktioner för att interagera med databasen, som anropas från routrar.

from datetime import datetime

from sqlalchemy.orm import Session

from .models import Competitor, Station, TimeEntry


def get_competitors(db: Session) -> list[Competitor]:
    """Hämta alla tävlande från databasen."""
    return db.query(Competitor).all()


def get_times(db: Session) -> list[TimeEntry]:
    """Hämta alla tidsregistreringar från databasen."""
    return db.query(TimeEntry).all()


def get_times_by_start_number(db: Session, start_number: str) -> list[TimeEntry]:
    """Hämta tidsregistreringar för en specifik tävlande baserat på startnummer."""
    return (
        db.query(TimeEntry)
        .join(Competitor)
        .filter(Competitor.start_number == start_number)
        .all()
    )


def record_time_for_start_number(
    db: Session, start_number: str, timestamp: datetime | None, station_id: int
) -> TimeEntry | None:
    """Registrera en ny tid för en tävlande med angivet startnummer."""
    competitor = db.query(Competitor).filter_by(start_number=start_number).first()
    if competitor is None:
        return None  # hanteras i router
    entry = TimeEntry(
        competitor_id=competitor.id, timestamp=timestamp, station_id=station_id
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def record_new_reg(db: Session, start_number: str, name: str) -> Competitor:
    """Registrerar en ny competitor med starttid"""
    entry = Competitor(start_number=start_number, name=name)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def record_new_station(db: Session, station_name: str, order: str) -> Station:
    """Registrera en ny station"""
    entry = Station(station_name=station_name, order=order)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_stations(db: Session) -> list[Station]:
    """Hämta alla stationer från databasen."""
    return db.query(Station).all()
