# backend/app/schemas.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class RecordTimeIn(BaseModel):
    start_number: str


class CompetitorOut(BaseModel):
    id: int
    start_number: str
    name: str

    model_config = ConfigDict(from_attributes=True)


class TimeEntryOut(BaseModel):
    id: int
    competitor_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
