import enum
import strawberry
from typing import List, Optional
from datetime import datetime

from models.catalog import EventStatus, EventType, FieldType, FormField
from models.users import ParticipantType

class Role(str, enum.Enum):
    ADMIN = "admin"
    PARTICIPANT = "participant"
    ORGANIZER = "organizer"

class Provider(str, enum.Enum):
    # GOOGLE = "google"
    # GITHUB = "github"
    LOCAL = "local"

@strawberry.type
class User:
    id: strawberry.ID
    first_name: str
    last_name: str
    name: str
    email: str
    participant_type: ParticipantType
    college_org_name: str
    contact_number: str
    provider: Provider
    verified: bool
    role: Role
    interests: List[str]
    followed_clubs: List[str]
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime


@strawberry.type
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
    created_at: datetime
    updated_at: datetime


@strawberry.type
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
    tags: List[str]
    registration_fields: List[FormField]
    size_options: List[str]
    color_options: List[str]
    variants: List[str]
    stock_quantity: Optional[int] = None
    purchase_limit_per_participant: Optional[int] = None
    registrations: int
    sales: int
    revenue: float
    attendance: int
    team_completion: int
    created_at: datetime
    updated_at: datetime


@strawberry.type
class PasswordResetRequest:
    id: strawberry.ID
    organizer_id: str
    organizer_name: str
    requested_by_email: str
    reason: str
    status: str
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime