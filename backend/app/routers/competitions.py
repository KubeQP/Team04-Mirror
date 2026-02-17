# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import Competition

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/competitions", tags=["competitions"])


@router.get("/", response_model=list[schemas.CompetitionsOut])
def read_competition(db: Session = Depends(get_db)) -> list[Competition]:
    """Hämta alla tävlande från databasen."""
    return crud.get_competitions(db)


@router.post("/register", response_model=schemas.CompetitionsReg)
def reg_competition(
    db: Session = Depends(get_db)
):
    competition = crud.record_new_competition(db)
    return competition

@router.delete("/{competition_id}")
def delete_competition(competition_id: int, db: Session = Depends(get_db)):
    success = crud.remove_competition(db, competition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Competition not found")
    return {"message": "Competition deleted"}