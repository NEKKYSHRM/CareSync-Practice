from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db.database import engine
from app.crud.CRUD_Patients.CRUD_Patients import (
    create_patient,
    delete_patient,
    get_all_patients,
    get_patient_by_id,
    update_patient,
)
from app.models.Model_Patients.Model_Patients import PatientGender
from app.schemas.Schema_Patients.Schema_Patients import (
    PatientCreateSchema,
    PatientResponseSchema,
    PatientUpdateSchema,
)
from app.utils.pagination import (
    PaginationParams,
    get_pagination_params,
    PaginatedResponse,
)


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


@router.post(
    "/register",
    response_model=PatientResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
async def register_patient(
    patient_data: PatientCreateSchema,
):
    """Register a new patient."""
    try:
        return await create_patient(engine, patient_data)
    except Exception:
        # Avoid exposing internal database errors to API clients.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register patient.",
        )


@router.get(
    "/list",
    response_model=PaginatedResponse[PatientResponseSchema],
)
async def list_patients(
    pagination: PaginationParams = Depends(
        get_pagination_params
    ),
    patient_id: str | None = Query(default=None),
    name: str | None = Query(default=None),
    gender: PatientGender | None = Query(default=None),
    blood_group: str | None = Query(default=None),
    active: bool | None = Query(default=True),
    created_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
    ),
):
    """List patients with pagination, filters, and sorting."""
    return await get_all_patients(
        engine=engine,
        pagination=pagination,
        patient_id=patient_id,
        name=name,
        gender=gender,
        blood_group=blood_group,
        active=active,
        created_order=created_order,
    )


@router.get(
    "/detail/{patient_id}",
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
    "/update/{patient_id}",
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
    "/delete/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_patient(
    patient_id: str,
):
    """Permanently delete a patient."""
    deleted = await delete_patient(engine, patient_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )

    return None
