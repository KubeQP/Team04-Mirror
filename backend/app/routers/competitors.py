# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/competitors", tags=["competitors"])


@router.get("/", response_model=list[schemas.CompetitorOut])
def read_competitors(db: Session = Depends(get_db)):
    return crud.get_competitors(db)

@router.post("/register", response_model=schemas.CompetitorReg)
def reg_competitor(data : schemas.CompetitorReg, db: Session = Depends(get_db)):
    competitor = crud.record_new_reg(db, data.start_number)
    time_entry = crud.record_time_for_start_number(db, data.start_number, data.timestamp)
    return {
        "start_number": competitor.start_number,
        "timestamp": time_entry.timestamp,
    }
    
    
    