# Metrica Assignment • Full‑Stack Form → PDF

This project is a mini full‑stack app that captures form data on the frontend, stores it in MongoDB, fills a Word‑style template, and generates a downloadable PDF, all with a clean UI and a simple API.

## Highlights
- React (Vite) frontend with validation and a submissions list
- FastAPI backend with MongoDB storage (Motor)
- Word template auto‑creation (DOCX) and pure‑Python PDF generation (ReportLab)
- File links designed for portability: database stores only flags; URLs are built dynamically for any environment

## Project structure
- `backend/` – FastAPI app, generates DOCX/PDF under `backend/generated/`
- `frontend/` – Vite React app for the form and submissions list

## Screenshots / Demo (optional)
- Replace this section with your screenshots or a short GIF of: fill → submit → download PDF

---

## Run locally

### 1) Backend
Copy env and run the API.

```powershell
# from repo root (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
copy backend\.env.example backend\.env
# then edit backend\.env and set MONGODB_URI
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

```bash
# Linux/macOS
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
# then edit backend/.env and set MONGODB_URI
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

### 2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the printed local URL (default http://localhost:5173). For local backend, the app will default to `http://127.0.0.1:8000`. You can also set `VITE_API_BASE`.

---

## Environment variables

Backend (`backend/.env`):
- `MONGODB_URI` – your MongoDB connection string
- `DB_NAME` – database name (default: `metrica_assignment`)
- `HOST` – API host (default: `127.0.0.1`)
- `PORT` – API port (default: `8000`)
- `PUBLIC_BASE_URL` – optional; when set, backend builds absolute file URLs using this base. If you proxy through your frontend (e.g., Vercel or Nginx), set it to the frontend’s public URL to emit HTTPS links like `https://your-frontend.com/api/download/...`.

Frontend (`frontend/.env`):
- `VITE_API_BASE` – API base URL. Examples:
	- Local dev: `http://127.0.0.1:8000`
	- With proxy (Vercel/Nginx): `/api`

---

## API reference
- `POST /api/submissions` – create a submission; returns `pdfUrl` (if PDF exists) and `docxUrl`.
- `GET /api/submissions` – list previous submissions with links.
- `GET /health` – quick liveness check.

### Data fields
```
FullName
Email
Mobile
Company
Role
Address
City
State
PinCode
Date
Remarks
```

---

## Template & PDF generation
- On first run, the backend auto‑creates `backend/templates/template.docx` with placeholders:
	- `{{FullName}}`, `{{Email}}`, `{{Mobile}}`, `{{Company}}`, `{{Role}}`,
	- `{{Address}}`, `{{City}}`, `{{State}}`, `{{PinCode}}`, `{{Date}}`, `{{Remarks}}`
- You can replace the template with your official DOCX (keep the placeholders).
- PDFs are generated directly with ReportLab for reliability and portability.

### File storage & links
- The database stores booleans `hasPdf` and `hasDocx` plus the submission data.
- URLs are assembled at response time based on the current environment, so you can move between localhost, staging, and production without rewriting stored data.

---

## Built with the help of AI
The scaffolding, API wiring, and PDF/template logic were accelerated with an AI assistant i.e Github Copilot. I verified, refined, and styled the UI/UX, and ensured the deployment was working smoothly.
