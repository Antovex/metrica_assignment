# Metrica Assignment (Full‑Stack)

React (Vite) frontend + FastAPI backend. Submits a form, stores data in MongoDB, fills a Word template, and returns a downloadable PDF.

## Folders
- `backend/` – FastAPI app. Generates DOCX/PDF and serves them from `/files`.
- `frontend/` – Vite React app for the form and submissions list.

## Quick start

1) Backend
- Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
- Install deps and run the API:

```powershell
# from repo root
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r backend\requirements.txt; uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Notes:
- PDF generation uses **ReportLab** (pure Python) - no Word or LibreOffice needed!
- Works on any platform (Windows, Linux, macOS)
- Perfect for cloud deployment (Render, Railway, Fly.io, etc.)

2) Frontend

```powershell
cd frontend; npm install; npm run dev
```

Open the printed local URL (default http://localhost:5173). Ensure API runs at http://127.0.0.1:8000 (or set `VITE_API_BASE`).

## API
- `POST /api/submissions` – create a submission, returns `pdfUrl` and/or `docxUrl`.
- `GET /api/submissions` – list previous submissions.
- `GET /health` – health check.

## Template
On first run, the backend auto-creates `backend/templates/template.docx` with these placeholders:

- Full Name: `{{FullName}}`
- Email Address: `{{Email}}`
- Mobile Number: `{{Mobile}}`
- Company / Institute Name: `{{Company}}`
- Department / Role: `{{Role}}`
- Address: `{{Address}}`
- City: `{{City}}`
- State: `{{State}}`
- Pin Code: `{{PinCode}}`
- Date of Submission: `{{Date}}`
- Remarks / Notes: `{{Remarks}}`

You can replace this file with the official provided template (keep the placeholders).

## Recording
Once both servers are running:
1) Fill the form and submit.
2) Click the returned PDF (or DOCX) link to view/download.
3) See submissions listed below the form.

## AI usage note
This project was scaffolded and wired end‑to‑end with an AI assistant for speed. It generated boilerplate, API endpoints, and the template creation logic, while I verified behavior and added UI polish.
