import os
import re
from datetime import datetime
from bson.objectid import ObjectId
from database import db
from pymongo.collection import Collection
from auth.utils import hash_password, verify_password
from auth.jwt import generate_token
from models.users import ParticipantType, ProfileUpdateInput, RegisterInput
from gql.schema import Provider, Role, User

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def get_user_db() -> Collection:
    return db["users"]

def _normalize_email(email: str) -> str:
    return email.strip().lower()

def _is_valid_email(email: str) -> bool:
    return bool(EMAIL_PATTERN.match(email))

def _is_iiit_email(email: str) -> bool:
    allowed_domains = [domain.strip().lower() for domain in os.getenv("IIIT_EMAIL_DOMAINS", "iiit.ac.in").split(",") if domain.strip()]
    normalized = _normalize_email(email)
    return any(normalized.endswith(f"@{domain}") for domain in allowed_domains)

def get_user_by_email(email: str):
    users = get_user_db()
    return users.find_one({"email": _normalize_email(email)})

def get_user_by_id(user_id: str):
    users = get_user_db()
    try:
        return users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None

def serialize_user(user_dict: dict) -> User:
    user_id = user_dict.get("_id") or user_dict.get("id")
    first_name = user_dict.get("first_name", "")
    last_name = user_dict.get("last_name", "")
    return User(
        id=str(user_id),
        first_name=first_name,
        last_name=last_name,
        name=user_dict.get("name", f"{first_name} {last_name}".strip()),
        email=user_dict.get("email", ""),
        participant_type=ParticipantType(user_dict.get("participant_type", ParticipantType.NON_IIIT.value)),
        college_org_name=user_dict.get("college_org_name", ""),
        contact_number=user_dict.get("contact_number", ""),
        provider=Provider(user_dict.get("provider", Provider.LOCAL.value)),
        verified=user_dict.get("verified", False),
        role=Role(user_dict.get("role", Role.PARTICIPANT.value)),
        interests=user_dict.get("interests", []),
        followed_clubs=user_dict.get("followed_clubs", []),
        bio=user_dict.get("bio"),
        created_at=user_dict.get("created_at"),
        updated_at=user_dict.get("updated_at"),
    )

def list_users():
    return [serialize_user(user_dict) for user_dict in get_user_db().find()]

def register(input: RegisterInput) -> User:
    users = get_user_db()
    email = _normalize_email(input.email)

    if not _is_valid_email(email):
        raise Exception("Enter a valid email address")

    if input.participant_type == ParticipantType.IIIT and not _is_iiit_email(email):
        raise Exception("IIIT participants must register with an IIIT email address")
    
    # Check if user exists
    existing = users.find_one({"email": email})
    if existing:
        raise Exception("This email is already signed up. Please login instead.")
        
    now = datetime.utcnow()
    full_name = f"{input.first_name} {input.last_name}".strip()
    
    # Create the user dict
    user_dict = {
        "first_name": input.first_name,
        "last_name": input.last_name,
        "name": full_name,
        "email": email,
        "password_hash": hash_password(input.password) if input.password else "",
        "participant_type": input.participant_type.value,
        "college_org_name": input.college_org_name,
        "contact_number": input.contact_number,
        "provider": input.provider or Provider.LOCAL.value,
        "verified": False,
        "role": Role.PARTICIPANT.value,
        "interests": input.interests,
        "followed_clubs": input.followed_clubs,
        "bio": None,
        "created_at": now,
        "updated_at": now
    }
    
    result = users.insert_one(user_dict)
    
    return serialize_user({**user_dict, "_id": result.inserted_id})

def update_profile(user_id: str, input: ProfileUpdateInput) -> User:
    users = get_user_db()
    current_user = get_user_by_id(user_id)
    if not current_user:
        raise Exception("User not found")

    updates = {"updated_at": datetime.utcnow()}

    if input.first_name is not None:
        updates["first_name"] = input.first_name
    if input.last_name is not None:
        updates["last_name"] = input.last_name
    if input.contact_number is not None:
        updates["contact_number"] = input.contact_number
    if input.college_org_name is not None:
        updates["college_org_name"] = input.college_org_name
    if input.bio is not None:
        updates["bio"] = input.bio
    if input.interests:
        updates["interests"] = input.interests
    if input.followed_clubs:
        updates["followed_clubs"] = input.followed_clubs

    if "first_name" in updates or "last_name" in updates:
        first_name = updates.get("first_name", current_user.get("first_name", ""))
        last_name = updates.get("last_name", current_user.get("last_name", ""))
        updates["name"] = f"{first_name} {last_name}".strip()

    users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    refreshed_user = users.find_one({"_id": ObjectId(user_id)})
    return serialize_user(refreshed_user)

def login(email: str, password: str) -> str:
    user_dict = get_user_by_email(email)
    if not user_dict:
        raise Exception("Invalid credentials")
        
    if user_dict.get("provider") != "local":
        raise Exception("Please login with your OAuth provider")
        
    if not verify_password(password, user_dict["password_hash"]):
        raise Exception("Invalid credentials")
        
    return generate_token(str(user_dict["_id"]))