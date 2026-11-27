from datetime import datetime
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field

from app.models.Model_Patients.Model_Patients import (
    CurrentStatus,
    HeaderSection,
    PatientAddress,
    PatientGender,
    PatientName,
    StatusHistory,
)


def get_current_date_time() -> tuple[str, str]:
    now = datetime.now(ZoneInfo("Asia/Kolkata"))
    return now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S")


class DateTimeInfoSchema(BaseModel):
    date: str | None = None
    time: str | None = None


class StatusHistorySchema(BaseModel):
    status: str
    date: DateTimeInfoSchema = Field(
        default_factory=lambda: DateTimeInfoSchema(
            date=get_current_date_time()[0],
            time=get_current_date_time()[1],
        )
    )


class CurrentStatusSchema(BaseModel):
    status: str = "created"
    date: DateTimeInfoSchema = Field(
        default_factory=lambda: DateTimeInfoSchema(
            date=get_current_date_time()[0],
            time=get_current_date_time()[1],
        )
    )


class HeaderSectionSchema(BaseModel):
    patient_id: str = Field(pattern=r"^PAT\d{10}$")

    date_created: DateTimeInfoSchema = Field(
        default_factory=lambda: DateTimeInfoSchema(
            date=get_current_date_time()[0],
            time=get_current_date_time()[1],
        )
    )

    current_status: CurrentStatusSchema = Field(
        default_factory=CurrentStatusSchema
    )

    status_history: list[StatusHistorySchema] = Field(
        default_factory=lambda: [
            StatusHistorySchema(status="created")
        ]
    )



class PatientAddressSchema(BaseModel):
    line: str | None = Field(default=None, max_length=250)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    pin: str | None = Field(default=None, pattern=r"^\d{6}$")


class PatientNameSchema(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)


class PatientCreateSchema(BaseModel):
    patient_name: PatientNameSchema
    mobile_number: str | None = Field(
        default=None,
        pattern=r"^\d{10}$",
    )
    email: str | None = Field(default=None, max_length=254)
    dob: str | None = None
    gender: PatientGender = PatientGender.NOT_APPLICABLE
    blood_group: str | None = None
    address: PatientAddressSchema = Field(default_factory=PatientAddressSchema)


class PatientUpdateSchema(BaseModel):
    patient_name: PatientNameSchema | None = None
    mobile_number: str | None = Field(
        default=None,
        pattern=r"^\d{10}$",
    )
    email: str | None = Field(default=None, max_length=254)
    dob: str | None = None
    gender: PatientGender | None = None
    blood_group: str | None = None
    address: PatientAddressSchema | None = None
    active: bool | None = None


class PatientResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    header_section: HeaderSectionSchema
    patient_name: PatientNameSchema
    mobile_number: str | None = None
    email: str | None = None
    dob: str | None = None
    gender: PatientGender
    blood_group: str | None = None
    address: PatientAddressSchema
    active: bool
