from odmantic import AIOEngine

from app.db.database import engine
from app.models.Model_Patients.Model_Patients import (
    Patient,
    PatientName,
    PatientAddress,
    CurrentStatus,
    DateTimeInfo,
    StatusHistory,
)
from app.schemas.Schema_Patients.Schema_Patients import (
    PatientCreateSchema,
    PatientUpdateSchema,
)
from datetime import datetime, timezone



async def create_patient(
    engine: AIOEngine,
    patient_data: PatientCreateSchema,
) -> Patient:
    """Create a new patient with an automatically generated patient ID."""
    data = patient_data.model_dump()

    patient = Patient(**data)

    await engine.save(patient)
    return patient


async def get_patient_by_id(
    engine: AIOEngine,
    patient_id: str,
) -> Patient | None:
    """Retrieve a patient using the public patient ID, not MongoDB _id."""
    return await engine.find_one(
        Patient,
        Patient.header_section.patient_id == patient_id,
    )


async def get_all_patients(
    engine: AIOEngine,
    skip: int = 0,
    limit: int = 20,
    active_only: bool = True,
) -> list[Patient]:
    """Retrieve patients with pagination."""
    if skip < 0:
        raise ValueError("skip cannot be negative")

    if limit < 1 or limit > 100:
        raise ValueError("limit must be between 1 and 100")

    if active_only:
        return await engine.find(
            Patient,
            Patient.active == True,
            skip=skip,
            limit=limit,
        )

    return await engine.find(
        Patient,
        skip=skip,
        limit=limit,
    )


async def update_patient(
    engine: AIOEngine,
    patient_id: str,
    update_data: PatientUpdateSchema,
) -> Patient | None:
    """Update a patient using the public patient ID."""
    patient = await get_patient_by_id(engine, patient_id)

    if patient is None:
        return None

    data = update_data.model_dump(exclude_unset=True)

    if "patient_name" in data and data["patient_name"] is not None:
        patient.patient_name = PatientName(**data.pop("patient_name"))

    if "address" in data and data["address"] is not None:
        address_updates = data.pop("address")
        current_address = patient.address.model_dump()
        current_address.update(address_updates)

        patient.address = PatientAddress(**current_address)

    for field, value in data.items():
        setattr(patient, field, value)

    await engine.save(patient)
    return patient


async def delete_patient(
    engine: AIOEngine,
    patient_id: str,
) -> bool:
    """Permanently delete a patient using the public patient ID."""
    patient = await get_patient_by_id(engine, patient_id)

    if patient is None:
        return False

    await engine.delete(patient)
    return True



async def update_patient_status(
    engine: AIOEngine,
    patient_id: str,
    new_status: str,
) -> Patient | None:
    """Update current status and append the new status to history."""

    patient = await get_patient_by_id(engine, patient_id)

    if patient is None:
        return None

    # Generate date and time using the model's shared helper.
    status_date = DateTimeInfo.current()

    # Update current status.
    patient.header_section.current_status = CurrentStatus(
        status=new_status,
        date=status_date,
    )

    # Append the new status to history.
    patient.header_section.status_history.append(
        StatusHistory(
            status=new_status,
            date=status_date,
        )
    )

    await engine.save(patient)

    return patient
