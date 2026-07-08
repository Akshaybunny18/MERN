from datetime import datetime
from typing import List, Optional

from bson.objectid import ObjectId

from database import db
from models.catalog import (
    Event,
    EventInput,
    EventStatus,
    EventType,
    FormField,
    Organizer,
    OrganizerInput,
    OrganizerUpdateInput,
    PasswordResetRequest,
    PasswordResetRequestInput,
    PasswordResetResolveInput,
)

ORGANIZER_SEED = [
    {"name": "0x1337: The Hacking Club", "category": "Club"},
    {"name": "Amateur Sports Enthusiasts Club", "category": "Club"},
    {"name": "Apex Body", "category": "Student Body"},
    {"name": "Astronautics Club", "category": "Club"},
    {"name": "Campus Life Council", "category": "Council"},
    {"name": "Campus Mental Health Support", "category": "Support"},
    {"name": "Clubs Council", "category": "Council"},
    {"name": "Cultural Council", "category": "Council"},
    {"name": "Cyclorama", "category": "Club"},
    {"name": "Decore-The Design Club", "category": "Club"},
    {"name": "Developer Student Club", "category": "Club"},
    {"name": "Election Commission", "category": "Student Body"},
    {"name": "Electronics and Robotics Club", "category": "Club"},
    {"name": "Entrepreneurship Cell", "category": "Cell"},
    {"name": "Felicity Taskforce", "category": "Taskforce"},
    {"name": "Finance Council", "category": "Council"},
    {"name": "Frivolous Humour Club", "category": "Club"},
    {"name": "ISAQC: IIIT Society for Applied Quantum Computing", "category": "Club"},
    {"name": "LeanIn Chapter IIITH", "category": "Club"},
    {"name": "Literary Club", "category": "Club"},
    {"name": "National Service Scheme", "category": "Student Body"},
    {"name": "Open-Source Developers Group", "category": "Club"},
    {"name": "Pentaprism", "category": "Club"},
    {"name": "Placement Cell", "category": "Cell"},
    {"name": "Programming Club", "category": "Club"},
    {"name": "Rouge-The Fashion Club", "category": "Club"},
    {"name": "Skateboarding Club", "category": "Club"},
    {"name": "Sports Council", "category": "Council"},
    {"name": "Student Alumni Connect Cell", "category": "Cell"},
    {"name": "Student Life Office", "category": "Office"},
    {"name": "Student Parliament", "category": "Student Body"},
    {"name": "Students Queer Club", "category": "Club"},
    {"name": "The Art Society", "category": "Club"},
    {"name": "The Chess Club", "category": "Club"},
    {"name": "The Dance Crew", "category": "Club"},
    {"name": "The Debate Society", "category": "Club"},
    {"name": "The Gaming Club", "category": "Club"},
    {"name": "The Language Club", "category": "Club"},
    {"name": "The Music Club", "category": "Club"},
    {"name": "The TV Room Quiz Club", "category": "Club"},
    {"name": "Theory Group", "category": "Club"},
]

EVENT_SEED = [
    {
        "name": "Neural Nexus Workshop",
        "organizer_name": "0x1337: The Hacking Club",
        "organizer_id": "seed-hacking",
        "event_type": EventType.NORMAL.value,
        "status": EventStatus.PUBLISHED.value,
        "eligibility": "IIIT students only",
        "description": "Hands-on intro to agentic workflows, prompt design, and local inference patterns.",
        "registration_deadline": datetime(2026, 7, 17, 18, 0),
        "start_date": datetime(2026, 7, 20, 10, 0),
        "end_date": datetime(2026, 7, 20, 13, 0),
        "registration_limit": 120,
        "registration_fee": 0,
        "tags": ["ai", "workshop", "hands-on"],
        "registrations": 84,
        "attendance": 68,
        "sales": 0,
        "revenue": 0,
        "team_completion": 22,
        "registration_fields": [{"label": "Team name"}, {"label": "Participant count"}, {"label": "Experience level"}],
    },
    {
        "name": "Campus Clash",
        "organizer_name": "Programming Club",
        "organizer_id": "seed-programming",
        "event_type": EventType.NORMAL.value,
        "status": EventStatus.ONGOING.value,
        "eligibility": "Open to all registered participants",
        "description": "A timed problem-solving showdown with live leaderboard updates.",
        "registration_deadline": datetime(2026, 7, 19, 20, 0),
        "start_date": datetime(2026, 7, 22, 9, 0),
        "end_date": datetime(2026, 7, 22, 18, 0),
        "registration_limit": 200,
        "registration_fee": 150,
        "tags": ["coding", "competition", "leaderboard"],
        "registrations": 153,
        "attendance": 97,
        "sales": 0,
        "revenue": 0,
        "team_completion": 31,
        "registration_fields": [{"label": "Preferred track"}, {"label": "College / org name"}],
    },
    {
        "name": "Merch Drop: Skyline Hoodie",
        "organizer_name": "Felicity Taskforce",
        "organizer_id": "seed-felicity",
        "event_type": EventType.MERCHANDISE.value,
        "status": EventStatus.PUBLISHED.value,
        "eligibility": "Participants only",
        "description": "Limited-run hoodies with size, color, and variant choices.",
        "registration_deadline": datetime(2026, 7, 18, 12, 0),
        "start_date": datetime(2026, 7, 23, 11, 0),
        "end_date": datetime(2026, 7, 23, 19, 0),
        "registration_limit": 50,
        "registration_fee": 999,
        "tags": ["merch", "hoodie", "drop"],
        "registrations": 32,
        "attendance": 0,
        "sales": 32,
        "revenue": 31968,
        "team_completion": 0,
        "stock_quantity": 18,
        "purchase_limit_per_participant": 2,
        "size_options": ["S", "M", "L", "XL"],
        "color_options": ["Black", "Sand", "Bottle Green"],
        "variants": ["Classic", "Oversized"],
    },
]


def get_organizer_db():
    return db["clubs"]


def get_event_db():
    return db["events"]


def get_password_reset_db():
    return db["password_reset_requests"]


def _serialize_form_field(field_dict: dict) -> FormField:
    return FormField(
        label=field_dict.get("label", ""),
        field_type=field_dict.get("field_type", "text"),
        required=field_dict.get("required", False),
        options=field_dict.get("options", []),
    )


def _serialize_organizer(organizer_dict: dict) -> Organizer:
    return Organizer(
        id=str(organizer_dict.get("_id") or organizer_dict.get("id")),
        name=organizer_dict.get("name", ""),
        category=organizer_dict.get("category", "Club"),
        description=organizer_dict.get("description", ""),
        contact_email=organizer_dict.get("contact_email", ""),
        contact_number=organizer_dict.get("contact_number"),
        login_email=organizer_dict.get("login_email"),
        discord_webhook=organizer_dict.get("discord_webhook"),
        active=organizer_dict.get("active", True),
        created_at=organizer_dict.get("created_at", datetime.utcnow()),
        updated_at=organizer_dict.get("updated_at", datetime.utcnow()),
    )


def _serialize_event(event_dict: dict) -> Event:
    return Event(
        id=str(event_dict.get("_id") or event_dict.get("id")),
        organizer_id=event_dict.get("organizer_id", ""),
        organizer_name=event_dict.get("organizer_name", ""),
        name=event_dict.get("name", ""),
        description=event_dict.get("description", ""),
        event_type=event_dict.get("event_type", EventType.NORMAL.value),
        status=event_dict.get("status", EventStatus.DRAFT.value),
        eligibility=event_dict.get("eligibility", ""),
        registration_deadline=event_dict.get("registration_deadline", datetime.utcnow()),
        start_date=event_dict.get("start_date", datetime.utcnow()),
        end_date=event_dict.get("end_date", datetime.utcnow()),
        registration_limit=event_dict.get("registration_limit", 0),
        registration_fee=event_dict.get("registration_fee", 0.0),
        tags=event_dict.get("tags", []),
        registration_fields=[_serialize_form_field(field) for field in event_dict.get("registration_fields", [])],
        size_options=event_dict.get("size_options", []),
        color_options=event_dict.get("color_options", []),
        variants=event_dict.get("variants", []),
        stock_quantity=event_dict.get("stock_quantity"),
        purchase_limit_per_participant=event_dict.get("purchase_limit_per_participant"),
        registrations=event_dict.get("registrations", 0),
        sales=event_dict.get("sales", 0),
        revenue=event_dict.get("revenue", 0.0),
        attendance=event_dict.get("attendance", 0),
        team_completion=event_dict.get("team_completion", 0),
        created_at=event_dict.get("created_at", datetime.utcnow()),
        updated_at=event_dict.get("updated_at", datetime.utcnow()),
    )


def _serialize_reset_request(request_dict: dict) -> PasswordResetRequest:
    return PasswordResetRequest(
        id=str(request_dict.get("_id") or request_dict.get("id")),
        organizer_id=request_dict.get("organizer_id", ""),
        organizer_name=request_dict.get("organizer_name", ""),
        requested_by_email=request_dict.get("requested_by_email", ""),
        reason=request_dict.get("reason", ""),
        status=request_dict.get("status", "pending"),
        resolved_by=request_dict.get("resolved_by"),
        resolved_at=request_dict.get("resolved_at"),
        created_at=request_dict.get("created_at", datetime.utcnow()),
    )


def seed_default_catalog():
    organizer_db = get_organizer_db()
    event_db = get_event_db()
    if organizer_db.count_documents({}) == 0:
        now = datetime.utcnow()
        documents = []
        for index, item in enumerate(ORGANIZER_SEED):
            documents.append(
                {
                    "name": item["name"],
                    "category": item["category"],
                    "description": f"{item['name']} on the IIIT campus.",
                    "contact_email": f"{item['name'].lower().replace(' ', '.').replace(':', '').replace('-', '')}@iiit.ac.in",
                    "contact_number": None,
                    "login_email": f"{item['name'].lower().replace(' ', '.').replace(':', '').replace('-', '')}@iiit.ac.in",
                    "discord_webhook": None,
                    "active": True,
                    "created_at": now,
                    "updated_at": now,
                }
            )
        inserted = organizer_db.insert_many(documents)
        organizer_id_by_name = {
            ORGANIZER_SEED[index]["name"]: str(inserted.inserted_ids[index])
            for index in range(len(ORGANIZER_SEED))
        }
    else:
        organizer_id_by_name = {
            item["name"]: str(item.get("_id") or item.get("id"))
            for item in organizer_db.find({})
        }
    if event_db.count_documents({}) == 0:
        now = datetime.utcnow()
        documents = []
        for index, item in enumerate(EVENT_SEED):
            documents.append(
                {
                    **item,
                    "organizer_id": organizer_id_by_name.get(item["organizer_name"], item["organizer_id"]),
                    "created_at": now,
                    "updated_at": now,
                    "tags": item.get("tags", []),
                    "registration_fields": item.get("registration_fields", []),
                    "size_options": item.get("size_options", []),
                    "color_options": item.get("color_options", []),
                    "variants": item.get("variants", []),
                }
            )
        event_db.insert_many(documents)


def list_organizers(active_only: bool = True) -> List[Organizer]:
    query = {"active": True} if active_only else {}
    return [_serialize_organizer(item) for item in get_organizer_db().find(query)]


def get_organizer_by_id(organizer_id: str) -> Optional[Organizer]:
    try:
        organizer = get_organizer_db().find_one({"_id": ObjectId(organizer_id)})
    except Exception:
        organizer = get_organizer_db().find_one({"id": organizer_id})
    return _serialize_organizer(organizer) if organizer else None


def create_organizer(input: OrganizerInput) -> Organizer:
    now = datetime.utcnow()
    document = {
        "name": input.name,
        "category": input.category,
        "description": input.description,
        "contact_email": input.contact_email,
        "contact_number": input.contact_number,
        "login_email": input.login_email,
        "discord_webhook": input.discord_webhook,
        "active": True,
        "created_at": now,
        "updated_at": now,
    }
    result = get_organizer_db().insert_one(document)
    return _serialize_organizer({**document, "_id": result.inserted_id})


def update_organizer(organizer_id: str, input: OrganizerUpdateInput) -> Organizer:
    organizer = get_organizer_by_id(organizer_id)
    if not organizer:
        raise Exception("Organizer not found")

    updates = {"updated_at": datetime.utcnow()}
    for key in ["name", "category", "description", "contact_email", "contact_number", "login_email", "discord_webhook", "active"]:
        value = getattr(input, key)
        if value is not None:
            updates[key] = value

    get_organizer_db().update_one({"_id": ObjectId(organizer_id)}, {"$set": updates})
    refreshed = get_organizer_db().find_one({"_id": ObjectId(organizer_id)})
    return _serialize_organizer(refreshed)


def disable_organizer(organizer_id: str) -> Organizer:
    return update_organizer(organizer_id, OrganizerUpdateInput(active=False))


def list_events(organizer_id: Optional[str] = None) -> List[Event]:
    query = {"organizer_id": organizer_id} if organizer_id else {}
    return [_serialize_event(item) for item in get_event_db().find(query)]


def get_event_by_id(event_id: str) -> Optional[Event]:
    try:
        event = get_event_db().find_one({"_id": ObjectId(event_id)})
    except Exception:
        event = get_event_db().find_one({"id": event_id})
    return _serialize_event(event) if event else None


def create_event(input: EventInput) -> Event:
    organizer = get_organizer_by_id(str(input.organizer_id))
    if not organizer:
        raise Exception("Organizer not found")

    now = datetime.utcnow()
    document = {
        "organizer_id": str(input.organizer_id),
        "organizer_name": organizer.name,
        "name": input.name,
        "description": input.description,
        "event_type": input.event_type.value,
        "status": EventStatus.DRAFT.value,
        "eligibility": input.eligibility,
        "registration_deadline": input.registration_deadline,
        "start_date": input.start_date,
        "end_date": input.end_date,
        "registration_limit": input.registration_limit,
        "registration_fee": input.registration_fee,
        "tags": input.tags,
        "registration_fields": [field.__dict__ for field in input.registration_fields],
        "size_options": input.size_options,
        "color_options": input.color_options,
        "variants": input.variants,
        "stock_quantity": input.stock_quantity,
        "purchase_limit_per_participant": input.purchase_limit_per_participant,
        "registrations": 0,
        "sales": 0,
        "revenue": 0.0,
        "attendance": 0,
        "team_completion": 0,
        "created_at": now,
        "updated_at": now,
    }
    result = get_event_db().insert_one(document)
    return _serialize_event({**document, "_id": result.inserted_id})


def update_event(event_id: str, input: EventUpdateInput) -> Event:
    event = get_event_by_id(event_id)
    if not event:
        raise Exception("Event not found")

    updates = {"updated_at": datetime.utcnow()}
    for key in [
        "name",
        "description",
        "event_type",
        "status",
        "eligibility",
        "registration_deadline",
        "start_date",
        "end_date",
        "registration_limit",
        "registration_fee",
        "stock_quantity",
        "purchase_limit_per_participant",
    ]:
        value = getattr(input, key)
        if value is not None:
            updates[key] = value.value if hasattr(value, "value") else value

    if input.tags:
        updates["tags"] = input.tags
    if input.registration_fields:
        updates["registration_fields"] = [field.__dict__ for field in input.registration_fields]
    if input.size_options:
        updates["size_options"] = input.size_options
    if input.color_options:
        updates["color_options"] = input.color_options
    if input.variants:
        updates["variants"] = input.variants

    if event.status in [EventStatus.ONGOING.value, EventStatus.COMPLETED.value] and input.status is None:
        raise Exception("Only status changes are allowed after an event starts")

    get_event_db().update_one({"_id": ObjectId(event_id)}, {"$set": updates})
    refreshed = get_event_db().find_one({"_id": ObjectId(event_id)})
    return _serialize_event(refreshed)


def publish_event(event_id: str) -> Event:
    return update_event(event_id, EventUpdateInput(status=EventStatus.PUBLISHED))


def close_event(event_id: str) -> Event:
    return update_event(event_id, EventUpdateInput(status=EventStatus.CLOSED))


def request_password_reset(input: PasswordResetRequestInput) -> PasswordResetRequest:
    organizer = get_organizer_by_id(str(input.organizer_id))
    if not organizer:
        raise Exception("Organizer not found")

    document = {
        "organizer_id": str(input.organizer_id),
        "organizer_name": organizer.name,
        "requested_by_email": input.requested_by_email,
        "reason": input.reason,
        "status": "pending",
        "resolved_by": None,
        "resolved_at": None,
        "created_at": datetime.utcnow(),
    }
    result = get_password_reset_db().insert_one(document)
    return _serialize_reset_request({**document, "_id": result.inserted_id})


def list_password_reset_requests(status: Optional[str] = None) -> List[PasswordResetRequest]:
    query = {"status": status} if status else {}
    return [_serialize_reset_request(item) for item in get_password_reset_db().find(query)]


def resolve_password_reset(request_id: str, input: PasswordResetResolveInput) -> PasswordResetRequest:
    request = get_password_reset_db().find_one({"_id": ObjectId(request_id)})
    if not request:
        raise Exception("Password reset request not found")

    updates = {
        "status": input.status,
        "resolved_by": input.resolved_by,
        "resolved_at": datetime.utcnow(),
    }
    get_password_reset_db().update_one({"_id": ObjectId(request_id)}, {"$set": updates})
    refreshed = get_password_reset_db().find_one({"_id": ObjectId(request_id)})
    return _serialize_reset_request(refreshed)
