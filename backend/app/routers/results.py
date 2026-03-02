# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/results", tags=["results"])


@router.post("/submit", response_model=schemas.Result)
def submit_results(data: schemas.SubmitResultsRequest, db: Session = Depends(get_db)) -> schemas.Result:
    rows = crud.get_results(
        db, data.token
    )  # returnerar List[DriverResult] (pydantic) eller ORM

    return schemas.Result(teamToken=data.token, jsonResult=rows)
