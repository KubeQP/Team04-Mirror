from sqlalchemy.orm import Session
from app import models
import datetime

def test_register_creates_competitor_and_time_entry(client, db_session: Session):
    payload = {"start_number": "2001", "timestamp": "2026-01-26T15:34:25.869866+00:00" }  # anpassa till ditt schema

    # Act
    res = client.post("/competitors/register", json=payload)  # anpassa prefix/route
    assert res.status_code == 200
    # Assert: competitor finns
    competitor = db_session.query(models.Competitor).filter_by(start_number="2001").first()
    assert competitor is not None

    # Assert: timeentry finns kopplad
    times = db_session.query(models.TimeEntry).filter_by(competitor_id=competitor.id).all()
    assert len(times) == 1
    assert times[0].timestamp is not None
