import strawberry
from typing import Optional
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class UserDocument:
    id: str
    name: str
    email: str
    password_hash: str
    provider: str
    verified: bool
    role: str
    created_at: datetime
    updated_at: datetime
    
    bio: Optional[str] = None

@strawberry.input
class RegisterInput:
    name: str
    email: str
    password: str
    provider: str = "local"