import os
from datetime import datetime
from database import db
from pymongo.collection import Collection
from auth.utils import hash_password, verify_password
from auth.jwt import generate_token
from models.users import RegisterInput, UserDocument
from gql.schema import User, Provider, Role

def get_user_db() -> Collection:
    return db["users"]

def get_user_by_email(email: str):
    users = get_user_db()
    return users.find_one({"email": email})

def register(input: RegisterInput) -> User:
    users = get_user_db()
    
    # Check if user exists
    existing = users.find_one({"email": input.email})
    if existing:
        raise Exception("User already exists")
        
    now = datetime.utcnow()
    
    # Create the user dict
    user_dict = {
        "name": input.name,
        "email": input.email,
        "password_hash": hash_password(input.password) if input.password else "",
        "provider": input.provider,
        "verified": False,
        "role": Role.USER.value,
        "bio": None,
        "created_at": now,
        "updated_at": now
    }
    
    result = users.insert_one(user_dict)
    
    return User(
        id=str(result.inserted_id),
        name=user_dict["name"],
        email=user_dict["email"],
        provider=Provider(user_dict["provider"]),
        verified=user_dict["verified"],
        role=Role(user_dict["role"]),
        bio=user_dict["bio"],
        created_at=user_dict["created_at"],
        updated_at=user_dict["updated_at"]
    )

def login(email: str, password: str) -> str:
    user_dict = get_user_by_email(email)
    if not user_dict:
        raise Exception("Invalid credentials")
        
    if user_dict.get("provider") != "local":
        raise Exception("Please login with your OAuth provider")
        
    if not verify_password(password, user_dict["password_hash"]):
        raise Exception("Invalid credentials")
        
    return generate_token(str(user_dict["_id"]))