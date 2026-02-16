# backend/app/routers/stations.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
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
) -> dict[str, str]:
    station = crud.record_new_station(db, data.station_name, data.order)
    return {"station_name": station.station_name, "order": station.order}


@router.patch("/updateOrder/")
def update_station_order(
    stations: list[schemas.StationReg],
    db: Session = Depends(get_db),
):
    for station in stations:
        db.query(models.Station).filter(
            models.Station.station_name == station.station_name
        ).update({"order": station.order})

    db.commit()

    return stations
