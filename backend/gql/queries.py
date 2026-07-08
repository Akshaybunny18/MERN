import strawberry
from typing import List, Optional

from gql.schema import Event, Organizer, PasswordResetRequest, User
from services.catalog_service import (
    get_event_by_id,
    get_organizer_by_id,
    list_events,
    list_organizers,
    list_password_reset_requests,
)
from services.auth_service import get_user_by_id, list_users, serialize_user

@strawberry.type
class Query:
    @strawberry.field
    def get_user(self, id: strawberry.ID) -> Optional[User]:
        user_dict = get_user_by_id(str(id))
        if not user_dict:
            return None
        return serialize_user(user_dict)

    @strawberry.field
    def get_users(self) -> List[User]:
        return list_users()

    @strawberry.field
    def me(self, info) -> Optional[User]:
        user = info.context.get("user")
        if not user:
            return None
        return serialize_user(user)

    @strawberry.field
    def get_clubs(self) -> List[Organizer]:
        return list_organizers(active_only=True)

    @strawberry.field
    def get_club(self, id: strawberry.ID) -> Optional[Organizer]:
        return get_organizer_by_id(str(id))

    @strawberry.field
    def get_events(self, organizer_id: Optional[str] = None) -> List[Event]:
        return list_events(organizer_id)

    @strawberry.field
    def get_event(self, id: strawberry.ID) -> Optional[Event]:
        return get_event_by_id(str(id))

    @strawberry.field
    def password_reset_requests(self, status: Optional[str] = None) -> List[PasswordResetRequest]:
        return list_password_reset_requests(status)
