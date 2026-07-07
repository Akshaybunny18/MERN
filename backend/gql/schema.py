import enum
import strawberry
from typing import Optional
from datetime import datetime
from typing import Optional

class Role(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class Provider(str, enum.Enum):
    # GOOGLE = "google"
    # GITHUB = "github"
    LOCAL = "local"

@strawberry.type
class User:
    id: strawberry.ID
    name: str
    email: str
    provider: Provider
    verified: bool
    role: Role
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime