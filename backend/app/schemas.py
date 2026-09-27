from datetime import date, time
from typing import Optional
from pydantic import BaseModel


class PatientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None


class VisitCreate(BaseModel):
    visit_date: Optional[date] = None
    procedure: str
    medicine: Optional[str] = None
    dentist_name: Optional[str] = None


class AppointmentCreate(BaseModel):
    patient_id: str
    appointment_date: date
    appointment_time: time
    procedure: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str  # scheduled | checked_in | completed | cancelled


class PaymentCreate(BaseModel):
    patient_id: str
    visit_id: Optional[str] = None
    amount: float
    paid: bool = False
    payment_date: Optional[date] = None
