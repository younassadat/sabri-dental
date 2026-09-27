import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.auth import get_current_staff
from app.supabase_client import supabase

router = APIRouter(prefix="/patients", tags=["pdf"])

CLINIC_BLUE = colors.HexColor("#1E56A0")


@router.get("/{patient_id}/history.pdf")
def patient_history_pdf(patient_id: str, staff: dict = Depends(get_current_staff)):
    patient = (
        supabase.table("patients").select("*").eq("id", patient_id).single().execute().data
    )
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visits = (
        supabase.table("visits")
        .select("*")
        .eq("patient_id", patient_id)
        .order("visit_number")
        .execute()
        .data
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("ClinicTitle", parent=styles["Title"], textColor=CLINIC_BLUE)

    elements = [
        Paragraph("Sabri's Dental Clinic", title_style),
        Paragraph("Patient visit history", styles["Heading2"]),
        Spacer(1, 6 * mm),
        Paragraph(f"<b>Name:</b> {patient['name']}", styles["Normal"]),
        Paragraph(f"<b>Phone:</b> {patient.get('phone') or '-'}", styles["Normal"]),
        Paragraph(f"<b>Age:</b> {patient.get('age') or '-'}", styles["Normal"]),
        Spacer(1, 8 * mm),
    ]

    if visits:
        table_data = [["Visit", "Date", "Procedure", "Medicine", "Dentist"]]
        for v in visits:
            table_data.append(
                [
                    str(v["visit_number"]),
                    str(v["visit_date"]),
                    v.get("procedure") or "-",
                    v.get("medicine") or "-",
                    v.get("dentist_name") or "-",
                ]
            )
        table = Table(table_data, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), CLINIC_BLUE),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        elements.append(table)
    else:
        elements.append(Paragraph("No visits recorded yet.", styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)

    filename = f"{patient['name'].replace(' ', '_')}_history.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
