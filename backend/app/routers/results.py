# backend/app/routers/competitors.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column
from sqlalchemy.orm import Session


from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/results", tags=["results"])


@router.post("/submit", response_model=schemas.Result)
def submit_results(db: Session = Depends(get_db)) -> schemas.Result:
    token = "c2dd9cc9-1cee-4435-82f1-7283fd0ef883"
    rows = crud.get_results(db)  # returnerar List[DriverResult] (pydantic) eller ORM

    return schemas.Result(teamToken=token, jsonResult=rows)








