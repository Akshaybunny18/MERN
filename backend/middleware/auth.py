from flask import request
from auth.jwt import decode_token
from services.auth_service import get_user_db
from bson.objectid import ObjectId

def get_context():
    context = {"user": None}
    
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        
        if payload and "sub" in payload:
            user_id = payload["sub"]
            users = get_user_db()
            try:
                user_dict = users.find_one({"_id": ObjectId(user_id)})
                if user_dict:
                    context["user"] = user_dict
            except Exception:
                pass
                
    return context
