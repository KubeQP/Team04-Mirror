# backend/app/crud.py

# Kommentar: CRUD står för Create, Read, Update, Delete och innehåller
# funktioner för att interagera med databasen, som anropas från routrar.

from datetime import datetime, time, timedelta

from sqlalchemy.orm import Session

from .models import Competitor, Station, TimeEntry
from .schemas import DriverResult, Result

from typing import cast, List, Optional


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


def update_competitor(
    db: Session, id: int | None, start_number: str | None, name: str | None
) -> Competitor | None:
    competitor = db.query(Competitor).filter(Competitor.id == id).first()

    if competitor is None:
        return None

    if start_number is not None:
        competitor.start_number = start_number
    if name is not None:
        competitor.name = name

    db.commit()
    db.refresh(competitor)
    return competitor


def update_time_entry(
    db: Session,
    id: int | None,
    competitor_id: int | None,
    timestamp: datetime | None,
    station_id: int | None,
) -> TimeEntry | None:
    entry = db.query(TimeEntry).filter(TimeEntry.id == id).first()

    if entry is None:
        return None

    if competitor_id is not None:
        entry.competitor_id = competitor_id
    if timestamp is not None:
        entry.timestamp = timestamp
    if station_id is not None:
        entry.station_id = station_id

    db.commit()
    db.refresh(entry)
    return entry

def fmt_timedelta(td: timedelta) -> str:
    total_seconds = int(td.total_seconds())
    h = total_seconds // 3600
    m = (total_seconds % 3600) // 60
    s = total_seconds % 60
    return f"{h:02}:{m:02}:{s:02}"


def get_results(db: Session) -> List["DriverResult"]:
    competitors = get_competitors(db)

    finished: List[tuple[int, DriverResult]] = []
    dnfs: List[DriverResult] = []

    def time_or_blank(dt) -> str:
        return dt.strftime("%H:%M:%S") if dt else ""

    for comp in competitors:
        entries = get_times_by_start_number(db, comp.start_number)

        startNbr = str(comp.start_number).zfill(3)
        name = comp.name

        # 🔥 Hitta start och mål via station
        start_entry = next(
            (e for e in entries if e.station.station_name == "start"),
            None,
        )
        end_entry = next(
            (e for e in entries if e.station.station_name == "mål"),
            None,
        )

        start_dt = start_entry.timestamp if start_entry else None
        end_dt = end_entry.timestamp if end_entry else None

        startTime = time_or_blank(start_dt)
        endTime = time_or_blank(end_dt)

        if start_dt and end_dt:
            total_td = end_dt - start_dt
            totalTime = fmt_timedelta(total_td)

            dr = DriverResult(
                plac="",
                startNbr=startNbr,
                name=name,
                totalTime=totalTime,
                startTime=startTime,
                endTime=endTime,
            )

            finished.append((int(total_td.total_seconds()), dr))
        else:
            dr = DriverResult(
                plac="DNF",
                startNbr=startNbr,
                name=name,
                totalTime="",
                startTime=startTime,
                endTime=endTime,
            )
            dnfs.append(dr)

    finished.sort(key=lambda x: x[0])

    for i, (_, dr) in enumerate(finished, start=1):
        dr.plac = str(i)

    return [dr for _, dr in finished] + dnfs