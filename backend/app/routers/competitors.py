# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/competitors", tags=["competitors"])


@router.get("/", response_model=list[schemas.CompetitorOut])
def read_competitors(db: Session = Depends(get_db)):
    return crud.get_competitors(db)
