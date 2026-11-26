
from fastapi import APIRouter

from app.api.endpoints import auth, users
from app.api.endpoints.Endpoint_Patients.Endpoint_Patients import (
    router as patients_router,
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(users.router)

api_router.include_router(patients_router)
