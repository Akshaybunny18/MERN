import enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

import strawberry


class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ONGOING = "ongoing"
    CLOSED = "closed"
    COMPLETED = "completed"


class EventType(str, enum.Enum):
    NORMAL = "normal"
    MERCHANDISE = "merchandise"


class FieldType(str, enum.Enum):
    TEXT = "text"
    DROPDOWN = "dropdown"
    CHECKBOX = "checkbox"
    FILE_UPLOAD = "file_upload"
    NUMBER = "number"
    DATE = "date"


@strawberry.type
@dataclass
class FormField:
    label: str
    field_type: FieldType = FieldType.TEXT
    required: bool = False
    options: List[str] = field(default_factory=list)


@strawberry.type
@dataclass
class Organizer:
    id: strawberry.ID
    name: str
    category: str
    description: str
    contact_email: str
    contact_number: Optional[str] = None
    login_email: Optional[str] = None
    discord_webhook: Optional[str] = None
    active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


@strawberry.type
@dataclass
class Event:
    id: strawberry.ID
    organizer_id: str
    organizer_name: str
    name: str
    description: str
    event_type: EventType
    status: EventStatus
    eligibility: str
    registration_deadline: datetime
    start_date: datetime
    end_date: datetime
    registration_limit: int
    registration_fee: float
    tags: List[str] = field(default_factory=list)
    registration_fields: List[FormField] = field(default_factory=list)
    size_options: List[str] = field(default_factory=list)
    color_options: List[str] = field(default_factory=list)
    variants: List[str] = field(default_factory=list)
    stock_quantity: Optional[int] = None
    purchase_limit_per_participant: Optional[int] = None
    registrations: int = 0
    sales: int = 0
    revenue: float = 0.0
    attendance: int = 0
    team_completion: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


@strawberry.type
@dataclass
class PasswordResetRequest:
    id: strawberry.ID
    organizer_id: str
    organizer_name: str
    requested_by_email: str
    reason: str
    status: str = "pending"
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)


@strawberry.input
class OrganizerInput:
    name: str
    category: str
    description: str
    contact_email: str
    contact_number: Optional[str] = None
    login_email: Optional[str] = None
    discord_webhook: Optional[str] = None


@strawberry.input
class OrganizerUpdateInput:
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_number: Optional[str] = None
    login_email: Optional[str] = None
    discord_webhook: Optional[str] = None
    active: Optional[bool] = None


@strawberry.input
class FormFieldInput:
    label: str
    field_type: FieldType = FieldType.TEXT
    required: bool = False
    options: List[str] = strawberry.field(default_factory=list)


@strawberry.input
class EventInput:
    organizer_id: strawberry.ID
    name: str
    description: str
    event_type: EventType
    eligibility: str
    registration_deadline: datetime
    start_date: datetime
    end_date: datetime
    registration_limit: int
    registration_fee: float
    tags: List[str] = strawberry.field(default_factory=list)
    registration_fields: List[FormFieldInput] = strawberry.field(default_factory=list)
    size_options: List[str] = strawberry.field(default_factory=list)
    color_options: List[str] = strawberry.field(default_factory=list)
    variants: List[str] = strawberry.field(default_factory=list)
    stock_quantity: Optional[int] = None
    purchase_limit_per_participant: Optional[int] = None


@strawberry.input
class EventUpdateInput:
    name: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    status: Optional[EventStatus] = None
    eligibility: Optional[str] = None
    registration_deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_limit: Optional[int] = None
    registration_fee: Optional[float] = None
    tags: List[str] = strawberry.field(default_factory=list)
    registration_fields: List[FormFieldInput] = strawberry.field(default_factory=list)
    size_options: List[str] = strawberry.field(default_factory=list)
    color_options: List[str] = strawberry.field(default_factory=list)
    variants: List[str] = strawberry.field(default_factory=list)
    stock_quantity: Optional[int] = None
    purchase_limit_per_participant: Optional[int] = None


@strawberry.input
class PasswordResetRequestInput:
    organizer_id: strawberry.ID
    requested_by_email: str
    reason: str


@strawberry.input
class PasswordResetResolveInput:
    status: str
    resolved_by: str
