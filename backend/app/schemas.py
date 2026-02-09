# backend/app/schemas.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

# Definierar hur data skickas och tas emot via API:et


class RecordTimeIn(BaseModel):
    start_number: str
    timestamp: datetime | None = None
    station_id: int | None = None


class CompetitorOut(BaseModel):
    id: int
    start_number: str
    name: str

    model_config = ConfigDict(from_attributes=True)


class TimeEntryOut(BaseModel):
    id: int
    competitor_id: int
    station_id: int | None = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class CompetitorReg(BaseModel):
    start_number: str
    name: str


class StationReg(BaseModel):
    station_name: str
    order: str


class StationOut(BaseModel):
    id: int
    station_name: str
    order: str

    model_config = ConfigDict(from_attributes=True)

class CompetitorUpdate(BaseModel):
    start_number: Optional[str] = None
    name: Optional[str] = None

class TimeEntryUpdate(BaseModel):
	competitor_id: Optional[int] = None
	timestamp: Optional[datetime] = None
	station_id: Optional[int] = None