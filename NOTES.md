# Backend Engineering Assessment - Design Notes

This document summarizes the design decisions and architecture for the implemented assessment tasks.

## Part A: Python Service (InsightOps)

### Database Design
- **Normalization**: Used a one-to-many relationship for `briefing_points` and `briefing_metrics` to ensure scalability.
- **Data Types**: Used `JSONB` or `TEXT` for dynamic content where appropriate, though currently following the schema requirements for strict fields.

### Validation Logic
- **Pydantic**: Heavily utilized Pydantic for input validation. 
- **Business Rules**: Implemented custom validators for:
    - Minimum content (2 key points, 1 risk).
    - Ticker normalization (upper case).
    - Uniqueness of metric names within a single briefing.

### Report Generation
- **Jinja2**: Used for rendering professional HTML reports.
- **View Models**: Transformed complex DB entities into clean dictionaries for the template, avoiding DB leaks in the view layer.

## Part B: TypeScript Service (TalentFlow)

### Architecture
- **Layered Design**: Followed NestJS best practices (Controller -> Service -> Entity).
- **Background Processing**: Used an interval-based worker (`SummaryWorker`) to poll the internal queue. This ensures the API remains responsive while long-running LLM tasks are handled asynchronously.

### LLM Integration
- **Gemini**: Implemented `GeminiSummarizationProvider` using the `@google/generative-ai` SDK.
- **Prompt Engineering**: Designed a structured prompt to enforce JSON output from the LLM, ensuring it matches our TypeScript interfaces.

### Security & Isolation
- **Workspace Scoping**: Every database query includes a `workspaceId` filter derived from the `x-workspace-id` header via the `FakeAuthGuard`. This ensures data isolation between different clients.
