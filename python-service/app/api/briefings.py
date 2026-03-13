from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.briefing import BriefingCreate, BriefingResponse
from app.services.briefing_service import BriefingService

router = APIRouter(prefix="/briefings", tags=["briefings"])

@router.post("", response_model=BriefingResponse, status_code=201)
def create_briefing(briefing_in: BriefingCreate, db: Session = Depends(get_db)):
    service = BriefingService(db)
    return service.create_briefing(briefing_in)

@router.get("/{id}", response_model=BriefingResponse)
def get_briefing(id: int, db: Session = Depends(get_db)):
    service = BriefingService(db)
    briefing = service.get_briefing(id)
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return briefing

@router.post("/{id}/generate")
def generate_report(id: int, db: Session = Depends(get_db)):
    service = BriefingService(db)
    html_content = service.generate_report(id)
    if not html_content:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return Response(content=html_content, media_type="text/html")

@router.get("/{id}/html")
def get_report_html(id: int, db: Session = Depends(get_db)):
    service = BriefingService(db)
    html_content = service.get_html(id)
    if not html_content:
        raise HTTPException(status_code=404, detail="Generated report not found for this briefing")
    return Response(content=html_content, media_type="text/html")
