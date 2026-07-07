import strawberry
from typing import List, Optional
from backend.models.users import User, users_db

@strawberry.type
class Query:
    @strawberry.field
    def get_user(self, id: strawberry.ID) -> Optional[User]:
        return users_db.get(str(id))

    @strawberry.field
    def get_users(self) -> List[User]:
        return list(users_db.values())
