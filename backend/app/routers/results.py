# backend/app/routers/competitors.py
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/results", tags=["results"])


@router.post("/submit", response_model=schemas.Result)
def submit_results(
    data: schemas.SubmitResultsRequest, db: Session = Depends(get_db)
) -> schemas.Result:
    competition = db.query(crud.Competition).filter_by(id=data.competition_id).first()
    if not competition:
        return schemas.Result(teamToken="", jsonResult=[])

    token = competition.token
    rows = crud.get_results(
        db, token
    )  # returnerar List[DriverResult] (pydantic) eller ORM

    payload = {
        "teamToken": token,
        "jsonResult": [r.model_dump() for r in rows],
    }
    print(payload)
    try:
        response = httpx.post(
            "https://pvg-race.cs.lth.se/api/results/submit", json=payload
        )
        response.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502, detail=f"Failed to submit results: {str(e)}"
        ) from e

    return schemas.Result(teamToken=token, jsonResult=rows)
