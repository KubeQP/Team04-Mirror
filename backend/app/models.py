# backend/app/models.py
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

# Definierar vad vi lagrar i SQL-databasen


class Competitor(Base):
    __tablename__ = "competitors"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    start_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    competition_id = mapped_column(Integer)


class Station(Base):
    __tablename__ = "stations"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    station_name: Mapped[str] = mapped_column(String)
    order: Mapped[str] = mapped_column(String)
    competition_id = mapped_column(Integer)


class TimeEntry(Base):
    __tablename__ = "times"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    competitor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("competitors.id"), index=True
    )
    station_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("stations.id"), index=True
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    competition_id = mapped_column(Integer)

    competitor = relationship("Competitor")
    station = relationship("Station")


class Competition(Base): 
    __tablename__ = 'competitions'
    id: Mapped[int] = mapped_column(primary_key=True, index=True)