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
    db: Session, start_number: str, timestamp: datetime | None, station_id: int | None
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

def update_competitor(db: Session, competitor_id: int, data):
    competitor = db.query(Competitor).filter(Competitor.id == competitor_id).first()

    if competitor is None:
        return None

    if data.start_number is not None:
        competitor.start_number = data.start_number
    if data.name is not None:
        competitor.name = data.name

    db.commit()
    db.refresh(competitor)
    return competitor

def update_time_entry(db: Session, time_id: int, data):
	entry = db.query(TimeEntry).filter(TimeEntry.id == time_id).first()

	if entry is None:
		return None

	if data.competitor_id is not None:
		entry.competitor_id = data.competitor_id
	if data.timestamp is not None:
		entry.timestamp = data.timestamp
	if data.station_id is not None:
		entry.station_id = data.station_id

	db.commit()
	db.refresh(entry)
	return entry