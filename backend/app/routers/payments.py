from datetime import date as date_cls
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_staff
from app.schemas import PaymentCreate
from app.supabase_client import supabase

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("")
def list_payments(day: Optional[str] = None, staff: dict = Depends(get_current_staff)):
    target_day = day or str(date_cls.today())
    return (
        supabase.table("payments")
        .select("*, patients(name)")
        .eq("payment_date", target_day)
        .order("created_at", desc=True)
        .execute()
        .data
    )


@router.post("")
def create_payment(payment: PaymentCreate, staff: dict = Depends(get_current_staff)):
    payload = payment.model_dump()
    payload["payment_date"] = str(payload.get("payment_date") or date_cls.today())
    result = supabase.table("payments").insert(payload).execute()
    return result.data[0]


@router.put("/{payment_id}/mark-paid")
def mark_paid(payment_id: str, staff: dict = Depends(get_current_staff)):
    result = (
        supabase.table("payments")
        .update({"paid": True})
        .eq("id", payment_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Payment not found")
    return result.data[0]
