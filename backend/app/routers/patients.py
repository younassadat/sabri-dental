from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_staff
from app.schemas import PatientCreate
from app.supabase_client import supabase

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("")
def list_patients(search: Optional[str] = None, staff: dict = Depends(get_current_staff)):
    query = supabase.table("patients").select("*").order("name")
    if search:
        query = query.or_(f"name.ilike.%{search}%,phone.ilike.%{search}%")
    return query.execute().data


@router.post("")
def create_patient(patient: PatientCreate, staff: dict = Depends(get_current_staff)):
    result = supabase.table("patients").insert(patient.model_dump()).execute()
    return result.data[0]


@router.get("/{patient_id}")
def get_patient(patient_id: str, staff: dict = Depends(get_current_staff)):
    result = supabase.table("patients").select("*").eq("id", patient_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return result.data


@router.put("/{patient_id}")
def update_patient(patient_id: str, patient: PatientCreate, staff: dict = Depends(get_current_staff)):
    result = (
        supabase.table("patients")
        .update(patient.model_dump())
        .eq("id", patient_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return result.data[0]
