# backend/app/models.py
from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class Competitor(Base):
    __tablename__ = "competitors"
    id = Column(Integer, primary_key=True, index=True)
    start_number = Column(String, unique=True, index=True)
    name = Column(String)


class TimeEntry(Base):
    __tablename__ = "times"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id"), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))

    competitor = relationship("Competitor")
