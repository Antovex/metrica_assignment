from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class SubmissionIn(BaseModel):
    FullName: str = Field(..., min_length=2)
    Email: EmailStr
    Mobile: str = Field(..., min_length=7, max_length=20)
    Company: Optional[str] = None
    Role: Optional[str] = None
    Address: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    PinCode: Optional[str] = None
    Date: Optional[str] = None  # allow client-provided date string
    Remarks: Optional[str] = None


class SubmissionDB(SubmissionIn):
    id: str
    createdAt: datetime
    pdfUrl: Optional[str] = None
    docxUrl: Optional[str] = None
