# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import Competitor

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/competitors", tags=["competitors"])


@router.get("/", response_model=list[schemas.CompetitorOut])
def read_competitors(db: Session = Depends(get_db)) -> list[Competitor]:
    """Hämta alla tävlande från databasen."""
    return crud.get_competitors(db)


@router.post("/register", response_model=schemas.CompetitorReg)
def reg_competitor(
    data: schemas.CompetitorReg, db: Session = Depends(get_db)
) -> dict[str, str]:
    competitor = crud.record_new_reg(db, data.start_number, data.name)
    return {"start_number": competitor.start_number, "name": competitor.name}


@router.put("/{identifier}", response_model=schemas.CompetitorOut)
def update_competitor(
    identifier: str,
    data: schemas.CompetitorUpdate,
    db: Session = Depends(get_db),
) -> Competitor:
    competitor = crud.update_competitor(db, identifier, data.start_number, data.name)

    if competitor is None:
        raise HTTPException(status_code=404, detail="Competitor not found")

    return competitor


@router.delete("/{start_number}")
def delete_competitor(
    start_number: str, db: Session = Depends(get_db)
) -> dict[str, str]:
    competitor = db.query(Competitor).filter_by(start_number=start_number).first()

    if competitor is None:
        raise HTTPException(status_code=404, detail="Competitor not found")

    db.delete(competitor)
    db.commit()

    return {"detail": "Competitor deleted"}
