# Backend Engineering Assessment - Design Notes

## Part A: Python Service (InsightOps)

### Database Schema
- **3 tables**: `briefings` (main record), `briefing_points` (key points + risks, discriminated by `point_type`), `briefing_metrics`.
- **Key decisions**: Unified `briefing_points` table for both key points and risks (using a `point_type` column) to reduce schema complexity while remaining queryable.
- **Foreign keys & indexes**: Indexed `briefing_id` on both child tables for read performance.

### Validation
- All validation is handled by **Pydantic** in `app/schemas/briefing.py`.
- `ticker` is normalized to uppercase automatically via a `@validator`.
- Custom validators enforce minimum content rules and unique metric names.

### Report Generation
- **Service/formatter layer** (`app/services/briefing_service.py`) transforms DB records into a clean view model dict before template rendering — raw DB objects are never passed to Jinja2 templates.
- **Jinja2** renders a professional, semantically structured HTML report with inline CSS.

### Tradeoffs
- Generated HTML is re-rendered on each `GET /html` request (not stored). With more time, I would persist the rendered HTML to object storage (e.g., S3) and serve it directly.

---

## Part B: TypeScript Service (TalentFlow)

### LLM Provider
- **Provider Used**: Google Gemini (`gemini-1.5-flash`) via the `@google/generative-ai` SDK.
- **How to configure**: Set `GEMINI_API_KEY` in `ts-service/.env`. Get a free key from [Google AI Studio](https://aistudio.google.com/).
- **Prompt Design**: A structured prompt requests JSON output directly from the model to match the `CandidateSummaryResult` interface. The response JSON is extracted by stripping any markdown code fences before parsing.

### Assumptions & Limitations
- Document "storage" is simulated: the `content` field in the upload request is stored as `rawText` directly. A production system would stream to object storage (e.g., GCS/S3) and store only the key.
- The in-memory queue (`QueueService`) is polled every 5 seconds by `SummaryWorker`. This is not durable — if the server restarts, pending jobs are lost. With more time, I would use a persistent queue (e.g., BullMQ + Redis or AWS SQS).
- Tests use `FakeSummarizationProvider` and do **not** make live LLM calls.

### Database Schema
- `candidate_documents`: stores document metadata and raw extracted text.
- `candidate_summaries`: stores full LLM output including `status`, `score`, `strengths`, `concerns`, `decision`, `provider`, `promptVersion`, and `errorMessage` for full lifecycle tracking.

### Access Control
- All endpoints are protected by `FakeAuthGuard`, which enforces the `x-user-id` and `x-workspace-id` headers.
- Every DB query for candidates filters by `workspaceId`, ensuring cross-workspace data isolation.

### What I Would Improve With More Time
- Persistent queue (BullMQ + Redis) for durability.
- Real file upload (`multipart/form-data`) with text extraction (e.g., pdf-parse).
- Retry logic in the worker for transient LLM failures.
- More comprehensive Jest tests covering the full worker flow.
- Rate limiting on the `/generate` endpoint to prevent LLM cost abuse.
