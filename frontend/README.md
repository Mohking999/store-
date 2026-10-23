# PhoneFix Frontend

A responsive Arabic-first PhoneFix public landing page built with React, TypeScript, Vite, and Tailwind CSS. French is available from the language switcher. The existing technician and admin workspaces remain available to staff; customer portal, customer registration, repair tracking, and customer repair-request routes have been removed.

The landing-page form validates customer input in the browser and displays a confirmation message. It is a front-end demo only: it does not send or store form fields or uploaded photos. Staff sign-in uses the configured backend and requires separately provisioned staff accounts; no default credentials are included.

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Run locally

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local development URL (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The build is written to `frontend/dist`.

## Deploy to Vercel

1. Import the repository into Vercel and keep **Root Directory** at the repository root. The root `vercel.json` defines a Vite service with `frontend/` as its root and routes all public paths to it.
2. The public landing page works without environment variables. To enable the retained staff dashboards, set `VITE_API_BASE_URL` in the Vercel project's environment variables for each required environment to the deployed Cloudflare Worker API base URL, including `/api/v1` (for example, `https://your-worker.example.workers.dev/api/v1`). This is a Vite build-time variable; the browser calls the Worker directly. Do not use the local `.env.example` URL in production.
3. The backend remains a separate Cloudflare Workers deployment because it requires Cloudflare D1 and R2 bindings. It is not included as a Vercel service, and no Vercel service binding is used.
4. Deploy the backend and frontend independently. The landing-page form is a mock and does not submit customer details.

The frontend repair request form is a mock and does not submit customer details. Configure real contact information and the WhatsApp phone number in `src/pages/HomePage.tsx` before publishing.

## Customize contact details

Before publishing, replace the example phone, address, and business-hours copy in both language entries in `src/pages/HomePage.tsx`. Set the WhatsApp destination in the same page to the business phone number using the international digits-only format supported by `https://wa.me/`.

The hero uses the local image at `public/assets/hero-repair.jpg`. Google Fonts (Cairo and Inter) are loaded from Google's free font CDN; the page otherwise uses the existing local dependencies and asset.

## Routes

- `/` — bilingual public landing page and mock repair request form
- `/login` — staff sign-in for the retained dashboards
- `/technician`, `/repairs/:id` — technician workspace
- `/admin` — admin dashboard

The existing Vercel SPA rewrite serves the app for these routes.
