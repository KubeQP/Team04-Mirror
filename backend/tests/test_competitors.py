# backend/tests/test_competitors.py
from sqlalchemy.orm import Session

from app import models


def test_get_competitors_empty(client):
    """Om det inte finns några tävlande ska vi få en tom lista."""
    response = client.get("/competitors")
    assert response.status_code == 200
    assert response.json() == []


def test_get_competitors_with_data(client, db_session: Session):
    """Endpointen ska returnera de tävlande som finns i databasen."""
    c1 = models.Competitor(start_number="1001", name="Team 1")
    c2 = models.Competitor(start_number="1002", name="Team 2")
    db_session.add_all([c1, c2])
    db_session.commit()

    response = client.get("/competitors")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2

    start_numbers = {c["start_number"] for c in data}
    names = {c["name"] for c in data}

    assert start_numbers == {"1001", "1002"}
    assert names == {"Team 1", "Team 2"}
