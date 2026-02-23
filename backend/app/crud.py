# backend/app/crud.py
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from .models import Competitor, Station, TimeEntry
from .schemas import DriverResult


def _as_utc(dt: datetime) -> datetime:
    """Convert naive or any datetime to UTC-aware."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)

    return dt.astimezone(UTC)


def get_competitors(db: Session) -> list[Competitor]:
    return db.query(Competitor).all()


def get_stations(db: Session) -> list[Station]:
    return db.query(Station).all()


def _utcify_entries(entries: list[TimeEntry]) -> list[TimeEntry]:
    """Ensure all TimeEntry timestamps are UTC-aware."""
    for e in entries:
        e.timestamp = _as_utc(e.timestamp)

    return entries


def get_times(db: Session) -> list[TimeEntry]:
    entries = db.query(TimeEntry).all()

    return _utcify_entries(entries)


def get_times_by_start_number(db: Session, start_number: str) -> list[TimeEntry]:
    entries = (
        db.query(TimeEntry)
        .join(Competitor)
        .filter(Competitor.start_number == start_number)
        .all()
    )

    return _utcify_entries(entries)


def record_time_for_start_number(
    db: Session,
    start_number: str | None,
    timestamp: datetime | None,
    station_id: int | None,
) -> TimeEntry:
    competitor = None
    if start_number:
        competitor = db.query(Competitor).filter_by(start_number=start_number).first()

    if timestamp is not None:
        # Convert incoming timestamp to naive UTC for SQLite
        timestamp = _as_utc(timestamp).replace(tzinfo=None)

    entry = TimeEntry(
        competitor_id=competitor.id if competitor else None,
        timestamp=timestamp,
        station_id=station_id,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Make timestamp UTC-aware before returning
    entry.timestamp = _as_utc(entry.timestamp)

    return entry


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
        # Convert to naive UTC for SQLite
        entry.timestamp = _as_utc(timestamp).replace(tzinfo=None)
    if station_id is not None:
        entry.station_id = station_id

    db.commit()
    db.refresh(entry)
    # Return UTC-aware datetime
    entry.timestamp = _as_utc(entry.timestamp)

    return entry


def delete_time_entry(db: Session, id: int) -> TimeEntry | None:
    entry = db.query(TimeEntry).filter(TimeEntry.id == id).first()
    if entry is None:
        return None
    db.delete(entry)
    db.commit()

    return entry


def record_new_reg(db: Session, start_number: str, name: str) -> Competitor:
    competitor = Competitor(start_number=start_number, name=name)
    db.add(competitor)
    db.commit()
    db.refresh(competitor)

    return competitor


def record_new_station(db: Session, station_name: str, order: str) -> Station:
    station = Station(station_name=station_name, order=order)
    db.add(station)
    db.commit()
    db.refresh(station)

    return station


def update_competitor(
    db: Session,
    identifier: str,
    start_number: str | None,
    name: str | None,
) -> Competitor | None:
    competitor = db.query(Competitor).filter(Competitor.id == identifier).first()
    if competitor is None and start_number is not None:
        competitor = db.query(Competitor).filter_by(start_number=identifier).first()
    if competitor is None:
        return None

    if start_number is not None:
        competitor.start_number = start_number
    if name is not None:
        competitor.name = name

    db.commit()
    db.refresh(competitor)

    return competitor


def fmt_timedelta(td: timedelta) -> str:
    total_seconds = int(td.total_seconds())
    h = total_seconds // 3600
    m = (total_seconds % 3600) // 60
    s = total_seconds % 60
    return f"{h:02}:{m:02}:{s:02}"


def get_results(db: Session) -> list[DriverResult]:
    competitors = get_competitors(db)

    finished: list[tuple[int, DriverResult]] = []
    dnfs: list[DriverResult] = []

    def time_or_blank(dt: datetime | None) -> str:
        if dt is None:
            return ""
        dt_utc = _as_utc(dt)

        return dt_utc.strftime("%H:%M:%S")

    for comp in competitors:
        entries = get_times_by_start_number(db, comp.start_number)

        startNbr = str(comp.start_number).zfill(3)
        name = comp.name

        start_entry = next(
            (e for e in entries if e.station.station_name == "start"), None
        )
        end_entry = next((e for e in entries if e.station.station_name == "mål"), None)

        start_dt = _as_utc(start_entry.timestamp) if start_entry else None
        end_dt = _as_utc(end_entry.timestamp) if end_entry else None

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
