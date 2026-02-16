# backend/app/routers/stations.py
from fastapi import APIRouter, Depends
from sqlalchemy import Column
from sqlalchemy.orm import Session

from app.models import Station

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/stations", tags=["stations"])


@router.get("/getstations", response_model=list[schemas.StationOut])
def read_stations(db: Session = Depends(get_db)) -> list[Station]:
    return crud.get_stations(db)


@router.post("/registerstation", response_model=schemas.StationReg)
def reg_station(
    data: schemas.StationReg, db: Session = Depends(get_db)
) -> dict[str, Column[str]]:
    station = crud.record_new_station(db, data.station_name, data.order, data.competition_id)
    return {"station_name": station.station_name, "order": station.order}
