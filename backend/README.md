# Phone Repair Management Platform — Backend (Cloudflare Workers API)

Production-oriented REST API backend built for the Algerian smartphone repair management platform.
Deployed on **Cloudflare Workers** with **Cloudflare D1** (relational SQLite), **Cloudflare R2** (private attachments), and **Cloudflare Turnstile** abuse prevention.

---

## 1. Technologies & Architecture

- **Runtime**: Cloudflare Workers (V8 Edge Compute)
- **Routing**: Hono v4 (`/api/v1`)
- **Database**: Cloudflare D1 (SQLite) with migrations & foreign keys
- **Storage**: Cloudflare R2 (Private bucket with authenticated worker streaming)
- **Security & Auth**:
  - Web Crypto API PBKDF2 (SHA-256, 100 000 iterations, 16-byte random salt)
  - Cryptographically random session tokens stored in D1 `sessions` table
  - Role-based authorization (`CUSTOMER`, `TECHNICIAN`, `ADMIN`)
  - Object-level authorization (customers can strictly view only their own records)
  - Privacy-preserving public tracking (zero customer PII leak)
  - In-memory sliding window rate limiter
  - MIME type magic bytes validation for file uploads (max 10MB)
- **Financial Exactness**: All monetary amounts stored as exact integer Dinars Algériens (DZD) without floating-point errors.
- **Workflow State Engine**: Strict transition enforcement for repair lifecycles and quotation invalidation.

---

## 2. Directory Structure

```
backend/
├── migrations/
│   ├── 0001_initial_schema.sql    # Core tables (users, devices, repairs, quotes, etc.)
│   ├── 0002_indexes.sql           # Performance & search indexes
│   └── 0003_permissions.sql       # Default repair shops in Algeria
├── scripts/
│   └── seed.sql                   # Realistic Algerian test dataset
├── src/
│   ├── app.ts                     # Hono application & CORS middleware
│   ├── index.ts                   # Worker entrypoint
│   ├── middleware/                # Auth, authorization, rate limit, error handler
│   ├── routes/                    # Versioned route controllers
│   ├── services/                  # Business logic (Workflow, Repairs, Quotes, Diagnostics)
│   ├── types/                     # TypeScript definitions
│   └── utils/                     # Crypto, validation (Algerian phone & schemas)
├── tests/                         # Vitest automated test suite
├── .dev.vars.example
├── package.json
├── tsconfig.json
└── wrangler.jsonc
```

---

## 3. Local Development

### Prerequisites
- Node.js >= 18
- npm >= 9

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
Copy `.dev.vars.example` to `.dev.vars`:
```bash
cp .dev.vars.example .dev.vars
```
Replace the example `JWT_SECRET` with a unique, random value for local development. Never use that local value in production.

### Step 3: Run Database Migrations Locally
```bash
npx wrangler d1 migrations apply phone-repair-db --local
```

### Step 4: Seed Database with Synthetic Local Sample Data
```bash
npx wrangler d1 execute phone-repair-db --local --file=./scripts/seed.sql
```
The seed script creates synthetic local records, generates fresh random public tracking tokens when run, and gives seeded users disabled passwords. Do not run it against production.

### Step 5: Start Local Development Server
```bash
npm run dev
# Starts local Cloudflare Worker at http://localhost:8787
```

---

## 4. Automated Testing

Run the test suite covering password hashing, Algerian phone validation, and state machine transition rules:
```bash
npm test
```

Typecheck without emitting:
```bash
npm run typecheck
```

---

## 5. Seed Data and Account Provisioning

The seed script provides sample repair records for local development. Seeded users have disabled passwords; the project does not include shared or default login credentials. Before using staff routes, provision staff accounts and set unique passwords through a trusted administrative process. Never use sample seed accounts in production.

---

## 6. Remote Cloudflare Production Deployment

### 1. Create Cloudflare D1 Database
```bash
npx wrangler d1 create phone-repair-db
```
Copy the returned UUID into `d1_databases[0].database_id` in `wrangler.jsonc`, replacing the placeholder value. Wrangler cannot deploy or apply remote migrations while the placeholder remains.

### 2. Apply Migrations to Remote D1
```bash
npx wrangler d1 migrations apply phone-repair-db --remote
```

### 3. Create Cloudflare R2 Bucket
```bash
npx wrangler r2 bucket create phone-repair-attachments
```

### 4. Configure Production Secrets
```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put TURNSTILE_SECRET_KEY
```
Set `JWT_SECRET` to a newly generated, unique random secret; do not reuse a development or previously exposed value. Wrangler prompts for each secret without adding it to `wrangler.jsonc`.

### 5. Deploy Worker
```bash
npm run deploy
```

---

## 7. API Endpoints Reference (`/api/v1`)

### Health
- `GET /api/v1/health`

### Authentication
- `POST /api/v1/auth/register` — Register customer
- `POST /api/v1/auth/login` — Login user & issue token
- `POST /api/v1/auth/logout` — Revoke session
- `GET /api/v1/auth/me` — Get authenticated user details

### Repairs & Public Tracking
- `POST /api/v1/repairs` — Submit repair request (public or authenticated)
- `GET /api/v1/repairs` — List repairs (scoped to customer if CUSTOMER; full filterable table if TECHNICIAN/ADMIN)
- `GET /api/v1/repairs/:id` — Get detailed repair dossier with quotes and history
- `GET /api/v1/repairs/track?reference=DZ-REP-XXXXXX&verify=PHONE_OR_TOKEN` — Privacy-preserving public tracking
- `PATCH /api/v1/repairs/:id/status` — Update status (enforces business workflow)

### Technical Diagnostics
- `POST /api/v1/repairs/:repairId/diagnosis` — Record inspection findings, suspected/confirmed cause, and repairability decision
- `GET /api/v1/repairs/:repairId/diagnosis` — Get diagnosis

### Quotations & Approvals
- `POST /api/v1/repairs/:repairId/quotes` — Create itemized quotation in DZD
- `POST /api/v1/quotes/:quoteId/approve` — Customer approves quote
- `POST /api/v1/quotes/:quoteId/reject` — Customer rejects quote

### Private Uploads
- `POST /api/v1/uploads` — Upload device photo (max 10MB, MIME verified)
- `GET /api/v1/uploads/:key` — Authenticated streaming from R2

### Dashboards
- `GET /api/v1/technician/dashboard` — Metric cards & urgent queue
- `GET /api/v1/admin/dashboard` — Revenue in DZD, brand chart, audit logs
