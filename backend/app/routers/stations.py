# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models import Station

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/stations", tags=["stations"])



@router.post("/registerstation", response_model=schemas.StationReg)
def reg_station(data : schemas.StationReg, db: Session = Depends(get_db)):
    station = crud.record_new_station(db,data.name,data.order)
    return {
        "name": station.name,
        "order": station.order
    }

@router.get("/getstations", response_model=schemas.StationOut)
def read_stations(data : schemas.StationOut, db: Session = Depends(get_db)):
    return crud.get_stations(db);
    
    
    