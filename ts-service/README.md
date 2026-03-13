# TalentFlow TypeScript Service Starter

NestJS starter service for the backend assessment.

This service includes:

- Nest bootstrap with global validation
- TypeORM + migration setup
- Fake auth context (`x-user-id`, `x-workspace-id`)
- Tiny workspace-scoped sample module
- Queue abstraction module
- LLM provider abstraction with a fake summarization provider
- Jest test setup

The assessment-specific candidate document and summary workflow is fully implemented.

## Prerequisites

- Node.js 22+
- npm
- PostgreSQL running from repository root:

```bash
docker compose up -d postgres
```

## Setup

```bash
cd ts-service
npm install
cp .env.example .env
```

## Environment

- `PORT`
- `DATABASE_URL`
- `NODE_ENV`
- `GEMINI_API_KEY`: Required for real LLM summarization. Get a free key at [Google AI Studio](https://aistudio.google.com/). Leave blank to see a startup error; for tests a fake provider is used automatically.

Do not commit API keys or other secrets to your repository. Use environment variables and include setup instructions in your README.

## Run Migrations

```bash
cd ts-service
npm run migration:run
```

## Run Service

```bash
cd ts-service
npm run start:dev
```

## Run Tests

```bash
cd ts-service
npm test
npm run test:e2e
```

## Fake Auth Headers

Sample endpoints in this starter are protected by a fake local auth guard.
Include these headers in requests:

- `x-user-id`: any non-empty string (example: `user-1`)
- `x-workspace-id`: workspace identifier used for scoping (example: `workspace-1`)

## Layout Highlights

- `src/auth/`: fake auth guard, user decorator, auth types
- `src/entities/`: starter entities
- `src/sample/`: tiny example module (controller/service/dto)
- `src/queue/`: in-memory queue abstraction
- `src/llm/`: provider interface + fake provider
- `src/migrations/`: TypeORM migration files
- `src/talent-flow/`: Intake and summarization module (controllers, services, workers, DTOs)
