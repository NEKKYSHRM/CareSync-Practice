from fastapi import APIRouter, HTTPException, Query, status

from app.db.database import engine

from app.crud.CRUD_Patients.CRUD_Patients import (
    create_patient,
    delete_patient,
    get_all_patients,
    get_patient_by_id,
    update_patient,
)

from app.schemas.Schema_Patients.Schema_Patients import (
    PatientCreateSchema,
    PatientResponseSchema,
    PatientUpdateSchema,
)


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


@router.post(
    "",
    response_model=PatientResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
async def register_patient(
    patient_data: PatientCreateSchema,
):
    """Register a new patient."""
    try:
        patient = await create_patient(engine, patient_data)
        return patient
    except Exception:
        # Avoid exposing internal database errors to API clients.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register patient.",
        )


@router.get(
    "",
    response_model=list[PatientResponseSchema],
)
async def list_patients(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    active_only: bool = Query(default=True),
):
    """List patients with pagination."""
    return await get_all_patients(
        engine=engine,
        skip=skip,
        limit=limit,
        active_only=active_only,
    )


@router.get(
    "/{patient_id}",
    response_model=PatientResponseSchema,
)
async def retrieve_patient(
    patient_id: str,
):
    """Retrieve a patient by the public patient ID."""
    patient = await get_patient_by_id(engine, patient_id)

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )

    return patient


@router.patch(
    "/{patient_id}",
    response_model=PatientResponseSchema,
)
async def modify_patient(
    patient_id: str,
    update_data: PatientUpdateSchema,
):
    """Update a patient's details using the public patient ID."""
    patient = await update_patient(
        engine=engine,
        patient_id=patient_id,
        update_data=update_data,
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )

    return patient


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_patient(
    patient_id: str,
):
    """Delete a patient using the public patient ID."""
    deleted = await delete_patient(engine, patient_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )

    return None
