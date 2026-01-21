# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models import Competitor

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/competitors", tags=["competitors"])


@router.get("/", response_model=list[schemas.CompetitorOut])
def read_competitors(db: Session = Depends(get_db)) -> list[Competitor]:
    return crud.get_competitors(db)
