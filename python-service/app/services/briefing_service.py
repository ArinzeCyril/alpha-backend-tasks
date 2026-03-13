from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.models.briefing import Briefing, BriefingPoint, BriefingMetric
from app.schemas.briefing import BriefingCreate
from app.services.report_formatter import ReportFormatter

class BriefingService:
    def __init__(self, db: Session):
        self.db = db
        self.formatter = ReportFormatter()

    def create_briefing(self, briefing_in: BriefingCreate) -> Briefing:
        # Create main briefing record
        db_briefing = Briefing(
            company_name=briefing_in.companyName,
            ticker=briefing_in.ticker,
            sector=briefing_in.sector,
            analyst_name=briefing_in.analystName,
            summary=briefing_in.summary,
            recommendation=briefing_in.recommendation
        )
        self.db.add(db_briefing)
        self.db.flush()  # Get ID

        # Add key points
        for i, point in enumerate(briefing_in.keyPoints):
            db_point = BriefingPoint(
                briefing_id=db_briefing.id,
                content=point,
                point_type="key_point",
                display_order=i
            )
            self.db.add(db_point)

        # Add risks
        for i, risk in enumerate(briefing_in.risks):
            db_risk = BriefingPoint(
                briefing_id=db_briefing.id,
                content=risk,
                point_type="risk",
                display_order=i
            )
            self.db.add(db_risk)

        # Add metrics
        if briefing_in.metrics:
            for metric in briefing_in.metrics:
                db_metric = BriefingMetric(
                    briefing_id=db_briefing.id,
                    name=metric.name,
                    value=metric.value
                )
                self.db.add(db_metric)

        self.db.commit()
        self.db.refresh(db_briefing)
        return db_briefing

    def get_briefing(self, briefing_id: int) -> Optional[Briefing]:
        return self.db.get(Briefing, briefing_id)

    def generate_report(self, briefing_id: int) -> Optional[str]:
        db_briefing = self.get_briefing(briefing_id)
        if not db_briefing:
            return None

        # Transform to View Model (Report Context)
        report_context = self._transform_to_report_context(db_briefing)

        # Render HTML
        template = self.formatter._env.get_template("report.html")
        html_content = template.render(**report_context)

        # Update status
        db_briefing.is_generated = True
        db_briefing.generated_at = datetime.now(timezone.utc)
        self.db.commit()

        return html_content

    def get_html(self, briefing_id: int) -> Optional[str]:
        db_briefing = self.get_briefing(briefing_id)
        if not db_briefing or not db_briefing.is_generated:
            return None
        
        # In a real app we might store the generated HTML, 
        # but here we'll re-render for simplicity or if it's required as "generated"
        report_context = self._transform_to_report_context(db_briefing)
        template = self.formatter._env.get_template("report.html")
        return template.render(**report_context)

    def _transform_to_report_context(self, briefing: Briefing) -> dict:
        key_points = sorted(
            [p.content for p in briefing.points if p.point_type == "key_point"],
            key=lambda x: x # Or use display_order if we stored it properly
        )
        risks = [p.content for p in briefing.points if p.point_type == "risk"]
        
        return {
            "title": f"Briefing Report: {briefing.company_name} ({briefing.ticker})",
            "company_name": briefing.company_name,
            "ticker": briefing.ticker,
            "sector": briefing.sector,
            "analyst_name": briefing.analyst_name,
            "summary": briefing.summary,
            "recommendation": briefing.recommendation,
            "key_points": key_points,
            "risks": risks,
            "metrics": [{"name": m.name, "value": m.value} for m in briefing.metrics],
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        }
