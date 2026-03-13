from datetime import datetime
from sqlalchemy import DateTime, String, func, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

from app.db.base import Base

class Briefing(Base):
    __tablename__ = "briefings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    analyst_name: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(String(2000), nullable=False)
    recommendation: Mapped[str] = mapped_column(String(2000), nullable=False)
    is_generated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    points: Mapped[List["BriefingPoint"]] = relationship(back_populates="briefing", cascade="all, delete-orphan")
    metrics: Mapped[List["BriefingMetric"]] = relationship(back_populates="briefing", cascade="all, delete-orphan")

class BriefingPoint(Base):
    __tablename__ = "briefing_points"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    briefing_id: Mapped[int] = mapped_column(ForeignKey("briefings.id"), nullable=False)
    content: Mapped[str] = mapped_column(String(1000), nullable=False)
    point_type: Mapped[str] = mapped_column(String(50), nullable=False) # 'key_point' or 'risk'
    display_order: Mapped[int] = mapped_column(nullable=False, default=0)

    # Relationships
    briefing: Mapped["Briefing"] = relationship(back_populates="points")

class BriefingMetric(Base):
    __tablename__ = "briefing_metrics"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    briefing_id: Mapped[int] = mapped_column(ForeignKey("briefings.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relationships
    briefing: Mapped["Briefing"] = relationship(back_populates="metrics")
