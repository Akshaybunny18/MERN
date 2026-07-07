from services import auth_service
import strawberry
from typing import Optional
from models.users import RegisterInput
from gql.schema import User

@strawberry.input
class LoginInput:
    email: str
    password: str

@strawberry.type
class AuthPayload:
    token: str

@strawberry.type
class Mutation:
    @strawberry.mutation
    def register(self, input: RegisterInput) -> User:
        return auth_service.register(input)

    @strawberry.mutation
    def login(self, input: LoginInput) -> AuthPayload:
        token = auth_service.login(input.email, input.password)
        return AuthPayload(token=token)