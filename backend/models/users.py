import enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

import strawberry


class ParticipantType(str, enum.Enum):
    IIIT = "iiit"
    NON_IIIT = "non_iiit"


@dataclass
class UserDocument:
    id: str
    first_name: str
    last_name: str
    name: str
    email: str
    password_hash: str
    participant_type: str
    college_org_name: str
    contact_number: str
    provider: str
    verified: bool
    role: str
    interests: List[str] = field(default_factory=list)
    followed_clubs: List[str] = field(default_factory=list)
    bio: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

@strawberry.input
class RegisterInput:
    first_name: str
    last_name: str
    email: str
    password: str
    participant_type: ParticipantType
    college_org_name: str
    contact_number: str
    interests: List[str] = strawberry.field(default_factory=list)
    followed_clubs: List[str] = strawberry.field(default_factory=list)
    provider: str = "local"


@strawberry.input
class ProfileUpdateInput:
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    college_org_name: Optional[str] = None
    bio: Optional[str] = None
    interests: List[str] = strawberry.field(default_factory=list)
    followed_clubs: List[str] = strawberry.field(default_factory=list)