from services import auth_service
from services.catalog_service import (
    close_event,
    create_event,
    create_organizer,
    disable_organizer,
    publish_event,
    request_password_reset,
    resolve_password_reset,
    update_event,
    update_organizer,
)
import strawberry
from typing import Optional
from models.catalog import (
    Event,
    EventInput,
    EventUpdateInput,
    Organizer,
    OrganizerInput,
    OrganizerUpdateInput,
    PasswordResetRequest,
    PasswordResetRequestInput,
    PasswordResetResolveInput,
)
from models.users import ProfileUpdateInput, RegisterInput
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

    @strawberry.mutation
    def update_profile(self, info, input: ProfileUpdateInput) -> User:
        user = info.context.get("user")
        if not user:
            raise Exception("Authentication required")
        return auth_service.update_profile(str(user["_id"]), input)

    @strawberry.mutation
    def create_organizer(self, info, input: OrganizerInput) -> Organizer:
        user = info.context.get("user")
        if not user or user.get("role") != "admin":
            raise Exception("Admin access required")
        return create_organizer(input)

    @strawberry.mutation
    def update_organizer(self, info, organizer_id: strawberry.ID, input: OrganizerUpdateInput) -> Organizer:
        user = info.context.get("user")
        if not user or user.get("role") not in ["admin", "organizer"]:
            raise Exception("Admin or organizer access required")
        return update_organizer(str(organizer_id), input)

    @strawberry.mutation
    def disable_organizer(self, info, organizer_id: strawberry.ID) -> Organizer:
        user = info.context.get("user")
        if not user or user.get("role") != "admin":
            raise Exception("Admin access required")
        return disable_organizer(str(organizer_id))

    @strawberry.mutation
    def create_event(self, info, input: EventInput) -> Event:
        user = info.context.get("user")
        if not user or user.get("role") not in ["admin", "organizer"]:
            raise Exception("Admin or organizer access required")
        return create_event(input)

    @strawberry.mutation
    def update_event(self, info, event_id: strawberry.ID, input: EventUpdateInput) -> Event:
        user = info.context.get("user")
        if not user or user.get("role") not in ["admin", "organizer"]:
            raise Exception("Admin or organizer access required")
        return update_event(str(event_id), input)

    @strawberry.mutation
    def publish_event(self, info, event_id: strawberry.ID) -> Event:
        user = info.context.get("user")
        if not user or user.get("role") not in ["admin", "organizer"]:
            raise Exception("Admin or organizer access required")
        return publish_event(str(event_id))

    @strawberry.mutation
    def close_event(self, info, event_id: strawberry.ID) -> Event:
        user = info.context.get("user")
        if not user or user.get("role") not in ["admin", "organizer"]:
            raise Exception("Admin or organizer access required")
        return close_event(str(event_id))

    @strawberry.mutation
    def request_password_reset(self, info, input: PasswordResetRequestInput) -> PasswordResetRequest:
        user = info.context.get("user")
        if not user or user.get("role") not in ["admin", "organizer"]:
            raise Exception("Admin or organizer access required")
        return request_password_reset(input)

    @strawberry.mutation
    def resolve_password_reset(self, info, request_id: strawberry.ID, input: PasswordResetResolveInput) -> PasswordResetRequest:
        user = info.context.get("user")
        if not user or user.get("role") != "admin":
            raise Exception("Admin access required")
        return resolve_password_reset(str(request_id), input)