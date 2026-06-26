# Private Markets API

A RESTful backend service for managing private market funds, investors, and investment commitments.

Built with TypeScript, Node.js, Express, PostgreSQL, Prisma, and Zod.

---

## Quick Start

### 1. Prerequisites
- Node.js 20+
- PostgreSQL running locally

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Update `.env` with your database connection:

```
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/private_marketsdb"
PORT=3000
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Start the server

```bash
npm run dev
```

### 6. Verify it is running

```bash
curl http://localhost:3000/api/health
```

---

## Architecture

This project uses a modular monolith architecture with a strict layered separation:

- **Controllers** — handle HTTP request and response only, no business logic
- **Zod validation** — sits inside the controller, validates the request body before the service is called. Bad data never reaches business logic
- **Services** — receive only clean, validated data and contain all business logic
- **Prisma layer** — all database access, no logic

Request lifecycle:

```
Client → Express Route → Controller → Zod Validation → Service → Prisma → PostgreSQL
```

If Zod validation fails, a 400 Bad Request is returned immediately. The service is never called.

Each domain is self-contained in its own module:

```
src/
  modules/
    funds/           fund.controller, fund.service, fund.routes, fund.schema, fund.types
    investors/       investor.controller, investor.service, investor.routes, investor.schema, investor.types
    investments/     investment.controller, investment.service, investment.routes, investment.schema, investment.types
    health/          health check endpoint
  shared/
    middleware/      global error handler, request logger
    prisma.client    singleton Prisma client
  app.ts             express app setup
  server.ts          entry point
```

Adding a new domain means adding a new folder. Nothing else changes.

---

## Database Design

The system models three core entities:

- **Fund** — an investment fund with a target size, vintage year, and lifecycle status
- **Investor** — an entity (individual, institution, or family office) that commits capital
- **Investment** — a transactional record of a capital commitment from an investor to a fund

### Relationships

- A fund has many investments
- An investor can make many investments across different funds
- An investment belongs to exactly one fund and one investor

### Design Decisions

**One commitment per investor per fund** — enforced via a unique constraint on `(fund_id, investor_id)`. In private markets, a capital commitment is a legal contract negotiated at fund closing, not an ongoing transaction like buying shares. An investor commits once. This constraint enforces that at the database level and returns a clean 409 Conflict if violated.

**onDelete: Restrict on investment foreign keys** — deleting a fund or investor that has investments attached is blocked at the database level. Financial records should never be silently removed.

**Decimal(18, 2) for monetary fields** — floating point arithmetic introduces rounding errors. All USD amounts use PostgreSQL native decimal type to ensure precision.

**UUID primary keys** — standard in financial systems, safe to expose in URLs, and avoids enumeration attacks.

**Snake_case field names** — matches the API spec directly, avoiding any transformation layer between the database and the JSON response.

### Enums

```
FundStatus:   Fundraising | Investing | Closed
InvestorType: Individual | Institution | FamilyOffice
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /funds | List all funds |
| POST | /funds | Create a fund |
| PUT | /funds/:id | Update a fund |
| GET | /funds/:id | Get a specific fund |
| GET | /investors | List all investors |
| POST | /investors | Create an investor |
| GET | /funds/:fund_id/investments | List investments for a fund |
| POST | /funds/:fund_id/investments | Create an investment |

Full spec: https://storage.googleapis.com/interview-api-doc-funds.wearebusy.engineering/index.html

---

## Error Handling

All errors return a consistent shape:

```json
{
  "success": false,
  "error": "Descriptive message"
}
```

| Status | Scenario |
|--------|----------|
| 400 | Invalid or missing input |
| 404 | Resource not found |
| 409 | Duplicate investment — investor already committed to this fund |
| 500 | Unexpected server error |

---

## AI Usage

This project was built with Claude (Anthropic) as a pair programming tool.

**AI was used for:**
- Scaffolding the initial project structure and boilerplate
- Debugging Prisma v7 compatibility issues with the adapter-based config
- Schema design discussion and validation against private markets domain knowledge
- Generating repetitive boilerplate such as controller and service files

**Decisions made independently:**
- Modular monolith over microservices given the scope
- Unique constraint on investments based on how capital commitments work in practice
- Snake_case field naming to match the spec without a transformation layer
- Restricting deletes on financial records rather than cascading
- Zod validation in the controller layer to keep services clean
