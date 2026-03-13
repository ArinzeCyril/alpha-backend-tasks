import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from typing import Generator

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.schemas.briefing import BriefingCreate

@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)

def test_create_briefing_success(client: TestClient):
    payload = {
        "companyName": "Test Company",
        "ticker": "test",
        "sector": "Technology",
        "analystName": "Jane Doe",
        "summary": "A positive outlook for the company.",
        "recommendation": "Buy",
        "keyPoints": ["Market leader", "Strong R&D"],
        "risks": ["Global competition"],
        "metrics": [{"name": "P/E", "value": "25"}]
    }
    response = client.post("/briefings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["company_name"] == "Test Company"
    assert data["ticker"] == "TEST"  # Check normalization
    assert len(data["points"]) == 3  # 2 key points + 1 risk

def test_create_briefing_validation_errors(client: TestClient):
    # Test min key points
    payload = {
        "companyName": "Fail Co",
        "ticker": "FAIL",
        "sector": "IT",
        "analystName": "John",
        "summary": "Summary",
        "recommendation": "Hold",
        "keyPoints": ["Only one point"],
        "risks": ["Risk"],
        "metrics": []
    }
    response = client.post("/briefings", json=payload)
    assert response.status_code == 422
    assert "At least 2 key points are required" in response.text

    # Test min risks
    payload["keyPoints"] = ["Point A", "Point B"]
    payload["risks"] = []
    response = client.post("/briefings", json=payload)
    assert response.status_code == 422
    assert "At least 1 risk is required" in response.text

    # Test unique metrics
    payload["risks"] = ["Risk A"]
    payload["metrics"] = [{"name": "Revenue", "value": "100"}, {"name": "Revenue", "value": "200"}]
    response = client.post("/briefings", json=payload)
    assert response.status_code == 422
    assert "Metric names must be unique" in response.text

def test_generate_and_get_report(client: TestClient):
    # Create first
    payload = {
        "companyName": "Render Co",
        "ticker": "RNDR",
        "sector": "Graphics",
        "analystName": "Artist",
        "summary": "Visual overview.",
        "recommendation": "Buy",
        "keyPoints": ["Fast rendering", "Low latency"],
        "risks": ["High cost"],
        "metrics": [{"name": "GPU Yield", "value": "95%"}]
    }
    create_res = client.post("/briefings", json=payload)
    briefing_id = create_res.json()["id"]

    # Generate
    gen_res = client.post(f"/briefings/{briefing_id}/generate")
    assert gen_res.status_code == 200
    assert "text/html" in gen_res.headers["content-type"]
    assert "Render Co" in gen_res.text
    assert "RNDR" in gen_res.text

    # Get HTML
    get_res = client.get(f"/briefings/{briefing_id}/html")
    assert get_res.status_code == 200
    assert "text/html" in get_res.headers["content-type"]

def test_get_html_not_generated(client: TestClient):
    payload = {
        "companyName": "Not Gen",
        "ticker": "NGEN",
        "sector": "None",
        "analystName": "Nobody",
        "summary": "...",
        "recommendation": "...",
        "keyPoints": ["P1", "P2"],
        "risks": ["R1"]
    }
    create_res = client.post("/briefings", json=payload)
    briefing_id = create_res.json()["id"]

    get_res = client.get(f"/briefings/{briefing_id}/html")
    assert get_res.status_code == 404
    assert "Generated report not found" in get_res.text
