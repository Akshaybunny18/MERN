import strawberry
import uuid
from typing import Optional
from backend.models.models import User, users_db

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, name: str, email: str, bio: Optional[str] = None) -> User:
        new_id = str(uuid.uuid4())
        user = User(
            id=strawberry.ID(new_id),
            name=name,
            email=email,
            bio=bio
        )
        users_db[new_id] = user
        return user

    @strawberry.mutation
    def update_user(self, id: strawberry.ID, name: Optional[str] = None, email: Optional[str] = None, bio: Optional[str] = None) -> Optional[User]:
        user_id = str(id)
        if user_id not in users_db:
            return None
        
        user = users_db[user_id]
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if bio is not None:
            user.bio = bio
            
        return user
