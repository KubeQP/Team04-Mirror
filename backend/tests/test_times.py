# backend/tests/test_times.py
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Competitor, Station, TimeEntry


def create_station(db_session: Session) -> Station:
    """Skapa en station som kan användas i testerna."""
    station = Station(station_name="Station 1", order="1")
    db_session.add(station)
    db_session.commit()
    db_session.refresh(station)
    return station


def test_get_times_empty(client: TestClient) -> None:
    """Om det inte finns några tider ska vi få en tom lista."""
    response = client.get("/api/times")
    assert response.status_code == 200
    assert response.json() == []


def test_get_times_with_data(client: TestClient, db_session: Session) -> None:
    """GET /api/times ska returnera alla tider i databasen."""
    station = create_station(db_session)

    c1 = Competitor(start_number="1001", name="Team 1")
    c2 = Competitor(start_number="1002", name="Team 2")
    db_session.add_all([c1, c2])
    db_session.commit()
    db_session.refresh(c1)
    db_session.refresh(c2)

    t1 = TimeEntry(competitor_id=c1.id, station_id=station.id)
    t2 = TimeEntry(competitor_id=c1.id, station_id=station.id)
    t3 = TimeEntry(competitor_id=c2.id, station_id=station.id)
    db_session.add_all([t1, t2, t3])
    db_session.commit()

    response = client.get("/api/times")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3

    competitor_ids = {t["competitor_id"] for t in data}
    assert competitor_ids == {c1.id, c2.id}


def test_get_times_by_start_number(client: TestClient, db_session: Session) -> None:
    """GET /api/times/{start_number} ska bara ge tider för rätt tävlande."""
    station = create_station(db_session)

    c1 = Competitor(start_number="1001", name="Team 1")
    c2 = Competitor(start_number="1002", name="Team 2")
    db_session.add_all([c1, c2])
    db_session.commit()
    db_session.refresh(c1)
    db_session.refresh(c2)

    db_session.add_all(
        [
            TimeEntry(competitor_id=c1.id, station_id=station.id),
            TimeEntry(competitor_id=c1.id, station_id=station.id),
            TimeEntry(competitor_id=c2.id, station_id=station.id),
        ]
    )
    db_session.commit()

    response = client.get("/api/times/1001")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2
    assert all(t["competitor_id"] == c1.id for t in data)


def test_get_times_by_start_number_unknown(
    client: TestClient, db_session: Session
) -> None:
    """Vad händer om startnumret inte finns? Här förväntar vi oss tom lista."""
    response = client.get("/api/times/9999")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_record_time_for_existing_competitor(
    client: TestClient, db_session: Session
) -> None:
    """POST /api/times/record ska skapa en ny TimeEntry för giltigt startnummer."""
    station = create_station(db_session)

    c1 = Competitor(start_number="1001", name="Team 1")
    db_session.add(c1)
    db_session.commit()
    db_session.refresh(c1)

    payload = {
        "start_number": "1001",
        "timeStamp": "2026-02-16T14:30:00Z",
        "station_id": station.id,
    }

    response = client.post("/api/times/record", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["competitor_id"] == c1.id
    assert isinstance(data["id"], int)
    assert isinstance(data["timestamp"], str)

    times_in_db = db_session.query(TimeEntry).filter_by(competitor_id=c1.id).all()
    assert len(times_in_db) == 1
    assert times_in_db[0].station_id == station.id


def test_record_time_for_unknown_competitor_returns_404(
    client: TestClient, db_session: Session
) -> None:
    """POST /api/times/record ska ge 404 om startnumret inte finns."""
    station = create_station(db_session)

    payload = {"start_number": "9999", "station_id": station.id}
    response = client.post("/api/times/record", json=payload)

    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert (
        "not found" in data["detail"].lower() or "finns inte" in data["detail"].lower()
    )
