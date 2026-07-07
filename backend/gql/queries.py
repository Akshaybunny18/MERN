import strawberry
from typing import List, Optional
from models.users import UserDocument, RegisterInput
from gql.schema import User, Provider, Role

@strawberry.type
class Query:
    @strawberry.field
    def get_user(self, id: strawberry.ID) -> Optional[User]:

        pass
