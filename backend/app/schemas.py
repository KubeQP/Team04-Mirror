# backend/app/schemas.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class RecordTimeIn(BaseModel):
    start_number: str
    timestamp: Optional[datetime] = None


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

class CompetitorReg(BaseModel):
    start_number: int
    timestamp: datetime
    name: str 

