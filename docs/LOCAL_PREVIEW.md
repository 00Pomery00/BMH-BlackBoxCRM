Local preview — Frontend

Prerequisites:
- Node.js (16+) and npm or Yarn
- Optional: backend running at http://localhost:8000 (for API calls). If backend not running, some features will show placeholders.

Commands (PowerShell):

# install deps
cd web-frontend
npm install

# run dev server (Vite)
npm run dev

# build production bundle
npm run build

# serve built site locally (simple)
npm install -g serve
serve -s dist -l 5173

Notes:
- The frontend expects the API compatibility endpoints at `/fu_auth/*` and `/auth/me`.
- Change language and theme in the header; language persisted in `localStorage.bbx_lang`.
- For Playwright E2E run, use CI with Docker or run Postgres locally and start the backend then run `npx playwright test` from project root.
