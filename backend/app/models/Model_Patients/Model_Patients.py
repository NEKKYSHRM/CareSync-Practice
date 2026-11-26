import secrets
from datetime import datetime, timezone
from enum import Enum
from odmantic import EmbeddedModel, Field, Model


def get_current_date_time() -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S")


class DateTimeInfo(EmbeddedModel):
    date: str | None = None
    time: str | None = None

    @classmethod
    def current(cls) -> "DateTimeInfo":
        date, time = get_current_date_time()
        return cls(date=date, time=time)


class StatusHistory(EmbeddedModel):
    status: str
    date: DateTimeInfo = Field(default_factory=DateTimeInfo.current)


class CurrentStatus(EmbeddedModel):
    status: str = "created"
    date: DateTimeInfo = Field(default_factory=DateTimeInfo.current)


class HeaderSection(EmbeddedModel):
    patient_id: str = Field(
        default_factory=lambda: f"PAT-{secrets.randbelow(10**10):010d}"
    )

    date_created: DateTimeInfo = Field(
        default_factory=DateTimeInfo.current
    )

    current_status: CurrentStatus = Field(
        default_factory=CurrentStatus
    )

    status_history: list[StatusHistory] = Field(
        default_factory=lambda: [
            StatusHistory(status="created")
        ]
    )

class PatientGender(str, Enum):
    MALE = "M"
    FEMALE = "F"
    OTHER = "O"
    NOT_APPLICABLE = "NA"


class PatientAddress(EmbeddedModel):
    line: str | None = Field(default=None, max_length=250)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    pin: str | None = Field(default=None, max_length=6)


class PatientName(EmbeddedModel):
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)


class Patient(Model):
    header_section: HeaderSection = Field(default_factory=HeaderSection)
    patient_name: PatientName

    # Contact information
    mobile_number: str | None = Field(
        default=None,
        max_length=10,
    )
    email: str | None = Field(default=None, max_length=254)

    # Demographic information
    dob: str | None = None
    gender: PatientGender = PatientGender.NOT_APPLICABLE
    blood_group: str | None = None

    # Address
    address: PatientAddress = Field(default_factory=PatientAddress)

    # Patient availability
    active: bool = True

    model_config = {
        "collection": "patientsColl",
    }
