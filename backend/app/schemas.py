# backend/app/schemas.py
from datetime import datetime

from pydantic import BaseModel, ConfigDict

# Definierar hur data skickas och tas emot via API:et


class RecordTimeIn(BaseModel):
    start_number: str
    timestamp: datetime | None = None
    station_id: int | None = None
    competition_id: int


class CompetitorOut(BaseModel):
    id: int
    start_number: str
    name: str
    competition_id: int

    model_config = ConfigDict(from_attributes=True)


class TimeEntryOut(BaseModel):
    id: int
    competitor_id: int
    station_id: int | None = None
    timestamp: datetime
    competition_id: int

    model_config = ConfigDict(from_attributes=True)


class CompetitorReg(BaseModel):
    start_number: str
    name: str
    competition_id: int


class StationReg(BaseModel):
    station_name: str
    order: str
    competition_id: int


class StationOut(BaseModel):
    id: int
    station_name: str
    order: str
    competition_id: int

    model_config = ConfigDict(from_attributes=True)
