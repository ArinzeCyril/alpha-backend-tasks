from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator

class MetricSchema(BaseModel):
    name: str = Field(..., min_length=1)
    value: str = Field(..., min_length=1)

class BriefingCreate(BaseModel):
    companyName: str = Field(..., alias="companyName")
    ticker: str = Field(...)
    sector: str = Field(...)
    analystName: str = Field(..., alias="analystName")
    summary: str = Field(...)
    recommendation: str = Field(...)
    keyPoints: List[str] = Field(..., alias="keyPoints")
    risks: List[str] = Field(...)
    metrics: Optional[List[MetricSchema]] = []

    @validator("ticker")
    def normalize_ticker(cls, v):
        return v.upper()

    @validator("keyPoints")
    def validate_key_points(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 key points are required")
        return v

    @validator("risks")
    def validate_risks(cls, v):
        if len(v) < 1:
            raise ValueError("At least 1 risk is required")
        return v

    @validator("metrics")
    def validate_unique_metrics(cls, v):
        if v:
            names = [m.name for m in v]
            if len(names) != len(set(names)):
                raise ValueError("Metric names must be unique within the same briefing")
        return v

    class Config:
        allow_population_by_field_name = True

class BriefingPointResponse(BaseModel):
    content: str
    point_type: str

    class Config:
        from_attributes = True

class BriefingMetricResponse(BaseModel):
    name: str
    value: str

    class Config:
        from_attributes = True

class BriefingResponse(BaseModel):
    id: int
    company_name: str
    ticker: str
    sector: str
    analyst_name: str
    summary: str
    recommendation: str
    is_generated: bool
    generated_at: Optional[datetime]
    created_at: datetime
    points: List[BriefingPointResponse]
    metrics: List[BriefingMetricResponse]

    class Config:
        from_attributes = True
