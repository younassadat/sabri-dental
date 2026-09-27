from datetime import date as date_cls
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_staff
from app.schemas import AppointmentCreate, AppointmentStatusUpdate
from app.supabase_client import supabase

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("")
def list_appointments(day: Optional[str] = None, staff: dict = Depends(get_current_staff)):
    target_day = day or str(date_cls.today())
    return (
        supabase.table("appointments")
        .select("*, patients(name, phone)")
        .eq("appointment_date", target_day)
        .order("appointment_time")
        .execute()
        .data
    )


@router.post("")
def create_appointment(appt: AppointmentCreate, staff: dict = Depends(get_current_staff)):
    payload = appt.model_dump()
    payload["appointment_date"] = str(payload["appointment_date"])
    payload["appointment_time"] = str(payload["appointment_time"])
    result = supabase.table("appointments").insert(payload).execute()
    return result.data[0]


@router.put("/{appointment_id}/status")
def update_status(appointment_id: str, update: AppointmentStatusUpdate, staff: dict = Depends(get_current_staff)):
    result = (
        supabase.table("appointments")
        .update({"status": update.status})
        .eq("id", appointment_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return result.data[0]
