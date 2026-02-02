# backend/app/models.py
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base

# Definierar vad vi lagrar i SQL-databasen


class Competitor(Base):
    __tablename__ = "competitors"
    id = Column(Integer, primary_key=True, index=True)
    start_number = Column(String, unique=True, index=True)
    name = Column(String)


class TimeEntry(Base):
    __tablename__ = "times"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id"), index=True)
    timestamp = Column(
    DateTime(timezone=True),
    nullable=False,
    default=lambda: datetime.now(timezone.utc),
    )


    competitor = relationship("Competitor")
