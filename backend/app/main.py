from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS
from app.auth import get_current_staff
from app.routers import patients, visits, appointments, payments, pdf

app = FastAPI(title="Sabri's Dental Clinic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/me")
def me(staff: dict = Depends(get_current_staff)):
    """Frontend calls this right after login to find out who's logged in and their role."""
    return staff


app.include_router(patients.router)
app.include_router(visits.router)
app.include_router(appointments.router)
app.include_router(payments.router)
app.include_router(pdf.router)
