from datetime import date as date_cls
from fastapi import APIRouter, Depends

from app.auth import get_current_staff
from app.schemas import VisitCreate
from app.supabase_client import supabase

router = APIRouter(prefix="/patients/{patient_id}/visits", tags=["visits"])


@router.get("")
def list_visits(patient_id: str, staff: dict = Depends(get_current_staff)):
    return (
        supabase.table("visits")
        .select("*")
        .eq("patient_id", patient_id)
        .order("visit_number")
        .execute()
        .data
    )


@router.post("")
def add_visit(patient_id: str, visit: VisitCreate, staff: dict = Depends(get_current_staff)):
    # Work out the next visit number for this patient (1st, 2nd, 3rd visit...)
    existing = (
        supabase.table("visits")
        .select("visit_number")
        .eq("patient_id", patient_id)
        .order("visit_number", desc=True)
        .limit(1)
        .execute()
        .data
    )
    next_number = (existing[0]["visit_number"] + 1) if existing else 1

    payload = visit.model_dump()
    payload["patient_id"] = patient_id
    payload["visit_number"] = next_number
    payload["visit_date"] = str(payload.get("visit_date") or date_cls.today())
    if not payload.get("dentist_name") and staff["role"] == "dentist":
        payload["dentist_name"] = staff["name"]

    result = supabase.table("visits").insert(payload).execute()
    return result.data[0]
