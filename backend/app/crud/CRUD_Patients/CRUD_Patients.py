import re
from odmantic import AIOEngine
from odmantic.query import or_
from app.models.Model_Patients.Model_Patients import Patient
from app.db.database import engine
from app.models.Model_Patients.Model_Patients import (
    Patient,
    PatientName,
    PatientAddress,
    CurrentStatus,
    PatientGender, 
    DateTimeInfo,
    StatusHistory,
)
from app.schemas.Schema_Patients.Schema_Patients import (
    PatientCreateSchema,
    PatientUpdateSchema,
)
from datetime import datetime, timezone
from app.utils.pagination import (
    PaginatedResponse,
    PaginationParams,
    paginate,
)


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
    pagination: PaginationParams,
    patient_id: str | None = None,
    name: str | None = None,
    gender: PatientGender | None = None,
    blood_group: str | None = None,
    active: bool | None = True,
    created_order: str = "desc",
) -> PaginatedResponse:
    """Retrieve patients with shared pagination, filters, and sorting."""

    filters = []

    # Patient ID: partial, case-insensitive search.
    if patient_id and patient_id.strip():
        pattern = re.escape(patient_id.strip())

        filters.append(
            Patient.header_section.patient_id.match(
                f".*{pattern}.*",
                case_insensitive=True,
            )
        )

    # Patient name: search first, middle, or last name.
    if name and name.strip():
        pattern = re.escape(name.strip())

        filters.append(
            or_(
                Patient.patient_name.first_name.match(
                    f".*{pattern}.*",
                    case_insensitive=True,
                ),
                Patient.patient_name.middle_name.match(
                    f".*{pattern}.*",
                    case_insensitive=True,
                ),
                Patient.patient_name.last_name.match(
                    f".*{pattern}.*",
                    case_insensitive=True,
                ),
            )
        )

    # Exact gender filter.
    if gender is not None:
        filters.append(Patient.gender == gender)

    # Exact blood group filter.
    if blood_group and blood_group.strip():
        filters.append(
            Patient.blood_group == blood_group.strip().upper()
        )

    # Active/inactive filter.
    if active is not None:
        filters.append(Patient.active == active)

    # Validate sort order.
    if created_order not in ("asc", "desc"):
        raise ValueError(
            "created_order must be 'asc' or 'desc'"
        )

    # Sort by creation date, then time, newest first by default.
    date_field = Patient.header_section.date_created.date
    time_field = Patient.header_section.date_created.time

    if created_order == "asc":
        sort = (date_field.asc(), time_field.asc())
    else:
        sort = (date_field.desc(), time_field.desc())

    return await paginate(
        engine,
        Patient,
        pagination,
        *filters,
        sort=sort,
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
