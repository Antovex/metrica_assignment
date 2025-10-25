import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from bson import ObjectId

from .config import get_settings
from .models import SubmissionIn
from .storage import Storage
from .pdf import build_context, render_docx, try_convert_to_pdf

app = FastAPI(title="Metrica Assignment API")

# CORS for local dev; adjust as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = get_settings()
storage = Storage()

# Static serving for generated files
GENERATED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "generated"))
os.makedirs(GENERATED_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=GENERATED_DIR), name="files")


@app.on_event("startup")
async def on_startup():
    await storage.connect()


@app.on_event("shutdown")
async def on_shutdown():
    await storage.close()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/submissions")
async def create_submission(payload: SubmissionIn):
    data = payload.model_dump()

    # Insert into DB (or fallback store)
    _id = await storage.insert_submission(data)
    # Build docx/pdf paths
    docx_name = f"{_id}.docx"
    pdf_name = f"{_id}.pdf"
    docx_path = os.path.join(GENERATED_DIR, docx_name)
    pdf_path = os.path.join(GENERATED_DIR, pdf_name)

    # Render DOCX from template
    template_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "templates", "template.docx"))
    context = build_context(data)
    render_docx(template_path, context, docx_path)

    # Convert to PDF using pure Python (no Word/LibreOffice needed)
    ok, err = try_convert_to_pdf(docx_path, pdf_path, context)

    # Store ONLY the file ID in database (not full URLs)
    # URLs will be built dynamically at request time
    await storage.update_urls(_id, has_pdf=ok, has_docx=True)

    # Build absolute URLs for THIS response
    base = settings.PUBLIC_BASE_URL.rstrip("/") if settings.PUBLIC_BASE_URL else f"http://{settings.HOST}:{settings.PORT}"
    docx_url = f"{base}/api/download/{_id}/docx"
    pdf_url = f"{base}/api/download/{_id}/pdf" if ok else None

    resp = {
        "id": _id,
        "pdfUrl": pdf_url,
        "docxUrl": docx_url,
        "message": "Created and generated PDF" if ok else (
            "DOCX generated. PDF conversion unavailable; returning DOCX link"
        ),
    }
    if not ok and err:
        resp["error"] = err
    return JSONResponse(content=resp)


@app.get("/api/submissions")
async def list_submissions():
    items = await storage.list_submissions()
    
    # Build URLs dynamically based on current environment
    base = settings.PUBLIC_BASE_URL.rstrip("/") if settings.PUBLIC_BASE_URL else f"http://{settings.HOST}:{settings.PORT}"
    
    for item in items:
        submission_id = item.get("id")
        # Build URLs only if files exist (based on stored flags)
        item["pdfUrl"] = f"{base}/api/download/{submission_id}/pdf" if item.get("hasPdf") else None
        item["docxUrl"] = f"{base}/api/download/{submission_id}/docx" if item.get("hasDocx") else None
        # Clean up internal flags from response
        item.pop("hasPdf", None)
        item.pop("hasDocx", None)
    
    return {"items": items}


@app.get("/api/download/{submission_id}/{file_type}")
async def download_file(submission_id: str, file_type: str):
    """Download a generated file (pdf or docx) with proper Content-Disposition header."""
    if file_type not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Use 'pdf' or 'docx'.")
    
    filename = f"{submission_id}.{file_type}"
    file_path = os.path.join(GENERATED_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    
    # Force download with Content-Disposition header
    media_type = "application/pdf" if file_type == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

