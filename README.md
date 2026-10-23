# Phone Repair Management Platform (Algeria)
### Vercel Frontend + Cloudflare Workers Backend | Two Separate Folders

A phone repair project for the Algerian market with a React public landing page and retained technician/admin workspaces. The public repair form is a front-end demonstration only: it validates input and shows a confirmation, but does not send or store customer information. Customer registration, tracking, and portal routes are not part of the frontend.

---

## 1. Architecture & Top-Level Separation

The project contains two completely decoupled, independently installable, configurable, and deployable folders:

```
phone-repair-platform/
├── frontend/           # React + Vite + Tailwind CSS + TypeScript (Deployed on Vercel)
│   ├── src/
│   ├── package.json
│   ├── vercel.json
│   └── README.md
│
├── backend/            # Cloudflare Workers + Hono + D1 + R2 + Turnstile (Deployed on Cloudflare)
│   ├── src/
│   ├── migrations/
│   ├── scripts/
│   ├── package.json
│   ├── wrangler.jsonc
│   └── README.md
│
├── .gitignore
└── README.md
```

- **No coupled root monorepo workspace**: Each directory has its own `package.json`, `tsconfig.json`, dependencies, scripts, and deployment configuration.
- **Staff frontend routes** communicate with the versioned Cloudflare Worker API under `/api/v1`. The public landing-page form is a mock and does not submit or store customer data.

---

## 2. Technology Stack

### Frontend (`frontend/`)
- **Framework**: React 18, TypeScript, and Vite
- **Styling**: Tailwind CSS for retained staff pages and scoped responsive styles for the public landing page
- **Public page**: Arabic-first, right-to-left landing page with French language option, service overview, and a client-side-only repair request form
- **Staff routes**: Existing technician and admin dashboards remain available behind staff authentication
- **Icons & Visuals**: Lucide React, Recharts, and the local phone-repair hero image
- **Deployment**: Vercel with SPA routing rewrite (`vercel.json`)

### Backend (`backend/`)
- **Runtime**: Cloudflare Workers (V8 Edge compute)
- **Framework**: Hono v4 REST API (`/api/v1`)
- **Database**: Cloudflare D1 (Relational SQLite) with migrations & indexes
- **Storage**: Cloudflare R2 (Private bucket with authenticated worker streaming)
- **Security & Crypto**:
  - Web Crypto API PBKDF2 (100,000 iterations, 16-byte random salt)
  - Cryptographically secure database-backed session tokens
  - Role-based access control (`CUSTOMER`, `TECHNICIAN`, `ADMIN`)
  - Object-level authorization for repair dossiers
  - Privacy-preserving public tracking (zero customer PII leak)
  - MIME magic-bytes validation for image uploads (max 10MB)
  - Rate limiting on public submissions and login attempts
- **Deployment**: Wrangler CLI

---

## 3. Strict Repair Status Workflow Engine

The platform enforces a strict backend state machine for device lifecycles:

```
[ NEW ] ──► [ UNDER_DIAGNOSIS ]
                    │
                    ├──► [ REPAIRABLE ] ──► [ QUOTE_PENDING ]
                    │                               │
                    ├──► [ UNREPAIRABLE ]           ├──► [ QUOTE_ACCEPTED ] ──► [ IN_REPAIR ] ──► [ REPAIR_COMPLETED ] ──► [ READY_FOR_PICKUP ] ──► [ DELIVERED ]
                    │                               │                                 │
                    └──► [ WAITING_FOR_PARTS ]      └──► [ QUOTE_REJECTED ]           └──► (Revision requires new quote)
```

### Core Business Rules:
1. **Inspection Required**: A technician must perform an inspection before marking a device `REPAIRABLE` or `UNREPAIRABLE`.
2. **Mandatory Explanation**: Declaring an unrepairable device requires a detailed technical explanation.
3. **Quotation Prerequisite**: A repair quotation must be available before customer approval.
4. **Customer Approval Before Repair**: The repair **cannot** start before explicit approval of the current quotation (`IN_REPAIR` requires an accepted quote).
5. **Approval Invalidation**: Changing or revising a quotation after approval invalidates the previous approval and requires renewed customer approval.
6. **Audit Trail**: Every single transition is recorded in `repair_status_history` with the user ID, timestamp, and notes.

---

## 4. Quick Start (Local Development)

Run the frontend on its own to view the public landing page. The retained staff dashboards require the backend; start both if you need those routes.

### Terminal 1: Backend (Cloudflare Worker & Local D1)
```bash
cd backend
npm install
# Run local migrations:
npx wrangler d1 migrations apply phone-repair-db --local
# Seed with Algerian sample data:
npx wrangler d1 execute phone-repair-db --local --file=./scripts/seed.sql
# Start local API:
npm run dev
# Worker starts at: http://localhost:8787
```

### Terminal 2: Frontend (React & Vite)
```bash
cd frontend
npm install
npm run dev
# Vite starts at: http://localhost:5173
```

---

## 5. Staff Account Provisioning

The seed script includes sample repair data, but seeded user accounts have disabled passwords. The frontend does not include demo sign-in credentials. Provision staff accounts with unique passwords through a trusted administrative process before using the technician or admin workspaces; never use sample seed data in production.

---

## 6. Automated Testing

Run the automated test suite in `backend/`:
```bash
cd backend
npm test
```
Tests cover:
- PBKDF2 password hashing & verification
- Algerian phone validation and normalization
- Quotation itemization and integer DZD validation
- State machine transition rules & approval invalidation

---

## 7. Production Deployment Instructions

### Deploying the Backend to Cloudflare Workers:
1. Log in to Wrangler:
   ```bash
   npx wrangler login
   ```
2. Create your remote D1 database and R2 bucket:
   ```bash
   cd backend
   npx wrangler d1 create phone-repair-db
   npx wrangler r2 bucket create phone-repair-attachments
   ```
3. Update `database_id` in `backend/wrangler.jsonc`.
4. Run migrations on remote D1:
   ```bash
   npx wrangler d1 migrations apply phone-repair-db --remote
   ```
5. Configure secrets:
   ```bash
   npx wrangler secret put JWT_SECRET
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```
6. Deploy the worker:
   ```bash
   npm run deploy
   ```

### Deploying the Frontend to Vercel:
1. Connect your Git repository to **Vercel**.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. The public landing page can be deployed without environment variables. To enable staff dashboards, add `VITE_API_BASE_URL` with the deployed Worker API URL, for example `https://your-backend-worker.workers.dev/api/v1`.
6. Deploy.
