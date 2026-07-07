import strawberry
from typing import Optional

@strawberry.type
class User:
    id: strawberry.ID
    name: str
    email: str
    bio: Optional[str] = None

# Dummy database for user profiles
users_db = {
    "1": User(
        id=strawberry.ID("1"),
        name="John Doe",
        email="john@example.com",
        bio="Software Engineer"
    )
}
