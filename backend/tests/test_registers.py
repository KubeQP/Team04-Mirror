from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app import models


def test_register_creates_competitor_and_time_entry(
    client: TestClient, db_session: Session
) -> None:
    payload = {"start_number": "2001", "name": "team4"}  # anpassa till ditt schema

    # Act
    res = client.post("/api/competitors/register", json=payload)  # anpassa prefix/route
    assert res.status_code == 200

    # Assert: competitor finns
    competitor = (
        db_session.query(models.Competitor).filter_by(start_number="2001").first()
    )
    assert competitor is not None

    # Assert: namn finns
    name = db_session.query(models.Competitor).filter_by(name="team4").first()
    assert name is not None
