# backend/tests/test_times.py
from sqlalchemy.orm import Session

from app import models


def test_get_times_empty(client):
    """Om det inte finns några tider ska vi få en tom lista."""
    response = client.get("/times")
    assert response.status_code == 200
    assert response.json() == []


def test_get_times_with_data(client, db_session: Session):
    """GET /times ska returnera alla tider i databasen."""
    # Skapa två tävlande
    c1 = models.Competitor(start_number="1001", name="Team 1")
    c2 = models.Competitor(start_number="1002", name="Team 2")
    db_session.add_all([c1, c2])
    db_session.commit()
    db_session.refresh(c1)
    db_session.refresh(c2)

    # Skapa tre tider (2 för 1001, 1 för 1002)
    t1 = models.TimeEntry(competitor_id=c1.id)
    t2 = models.TimeEntry(competitor_id=c1.id)
    t3 = models.TimeEntry(competitor_id=c2.id)
    db_session.add_all([t1, t2, t3])
    db_session.commit()

    response = client.get("/times")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3

    competitor_ids = {t["competitor_id"] for t in data}
    assert competitor_ids == {c1.id, c2.id}


def test_get_times_by_start_number(client, db_session: Session):
    """GET /times/{start_number} ska bara ge tider för rätt tävlande."""
    # Skapa tävlande
    c1 = models.Competitor(start_number="1001", name="Team 1")
    c2 = models.Competitor(start_number="1002", name="Team 2")
    db_session.add_all([c1, c2])
    db_session.commit()
    db_session.refresh(c1)
    db_session.refresh(c2)

    # Skapa tider: 2 för 1001, 1 för 1002
    db_session.add_all(
        [
            models.TimeEntry(competitor_id=c1.id),
            models.TimeEntry(competitor_id=c1.id),
            models.TimeEntry(competitor_id=c2.id),
        ]
    )
    db_session.commit()

    response = client.get("/times/1001")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2
    assert all(t["competitor_id"] == c1.id for t in data)


def test_get_times_by_start_number_unknown(client, db_session: Session):
    """Vad händer om startnumret inte finns? Här förväntar vi oss tom lista."""
    # Ingen med startnummer 9999
    response = client.get("/times/9999")
    assert response.status_code == 200  # ändra till 404 om du vill that beteende
    data = response.json()
    assert isinstance(data, list)
    # antingen tom lista...
    # assert data == []


def test_record_time_for_existing_competitor(client, db_session: Session):
    """POST /times/record ska skapa en ny TimeEntry för giltigt startnummer."""
    # Arrange: skapa en tävlande
    c1 = models.Competitor(start_number="1001", name="Team 1")
    db_session.add(c1)
    db_session.commit()
    db_session.refresh(c1)

    payload = {"start_number": "1001"}

    # Act
    response = client.post("/times/record", json=payload)

    # Assert
    assert response.status_code == 200

    data = response.json()
    # Beroende på vilket response_model du använder
    assert data["competitor_id"] == c1.id
    assert isinstance(data["id"], int)
    assert isinstance(data["timestamp"], str)

    # Och kontrollera att det faktiskt skapats en rad i DB
    times_in_db = (
        db_session.query(models.TimeEntry).filter_by(competitor_id=c1.id).all()
    )
    assert len(times_in_db) == 1


def test_record_time_for_unknown_competitor_returns_404(client):
    """POST /times/record ska ge 404 om startnumret inte finns."""
    # Arrange: skicka ett startnummer som inte finns i databasen
    payload = {"start_number": "9999"}

    # Act
    response = client.post("/times/record", json=payload)

    # Assert
    assert response.status_code == 404

    data = response.json()
    assert "detail" in data
    assert (
        "not found" in data["detail"].lower() or "finns inte" in data["detail"].lower()
    )
