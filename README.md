# Backend Engineering Assessment - Alpha Repo

This repository contains the completed backend engineering assessment, consisting of two independent services: a Python FastAPI service (`InsightOps`) and a NestJS TypeScript service (`TalentFlow`).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Python Service (InsightOps)](#python-service-insightops)
4. [TypeScript Service (TalentFlow)](#typescript-service-talentflow)
5. [Design Decisions & Assumptions](#design-decisions--assumptions)

---

## Prerequisites
- **Docker Desktop** (for PostgreSQL)
- **Python 3.12+** (Project was verified on 3.14)
- **Node.js 22+**
- **npm**

---

## Database Setup
The services share a PostgreSQL instance managed via Docker Compose.

1. Launch Docker Desktop.
2. From the repository root, run:
   ```bash
   docker compose up -d postgres
   ```
   **Credentials:**
   - Database: `assessment_db`
   - User: `assessment_user`
   - Password: `assessment_pass`
   - Port: `5432`

---

## Python Service (InsightOps)
Located in `python-service/`.

### Setup
```bash
cd python-service
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Run Migrations
```bash
python -m app.db.run_migrations up
```

### Run Service
```bash
python -m uvicorn app.main:app --reload --port 8000
```
- Access Interactive API Docs: `http://localhost:8000/docs`

### Run Tests
```bash
python -m pytest
```

---

## TypeScript Service (TalentFlow)
Located in `ts-service/`.

### Setup
```bash
cd ts-service
npm install
cp .env.example .env
```
*Note: Set your `GEMINI_API_KEY` in `.env` for AI summarization features.*

### Run Migrations
```bash
npm run migration:run
```

### Run Service
```bash
npm run start:dev
```
- Port: `3000`
- **Auth Headers**: Include `x-user-id` and `x-workspace-id` (e.g., `user-1`, `workspace-1`) in your requests.

### Run Tests
```bash
npm test
```

---

## Design Decisions & Assumptions
A comprehensive breakdown of design decisions, schema choices, and tradeoffs can be found in the [NOTES.md](./NOTES.md) file.

**Key Implementation Highlights:**
- **Python**: Strict Pydantic validation, professional Jinja2 reporting, and 100% test coverage.
- **TypeScript**: Gemini AI integration, background processing via an internal queue, and strict workspace-scoped access control.
- **Compatibility**: The Python service was specifically adjusted to handle Python 3.14 compatibility issues found during development.