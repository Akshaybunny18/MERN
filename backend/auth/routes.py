from flask import Blueprint, redirect, request, url_for, jsonify
from auth.oauth import get_google_provider_cfg, GOOGLE_CLIENT_ID

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login/google")
def login_google():
    # Boilerplate for redirecting user to Google Login
    google_provider_cfg = get_google_provider_cfg()
    if not google_provider_cfg:
        return jsonify({"error": "OAuth configuration unavailable"}), 500
        
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]
    
    # Normally you'd construct the URL with your client_id, redirect_uri, and scopes here
    # Example:
    # url = f"{authorization_endpoint}?client_id={GOOGLE_CLIENT_ID}&response_type=code&scope=openid email profile&redirect_uri=..."
    # return redirect(url)
    
    return jsonify({"message": "Redirect to Google Login logic here"})

@auth_bp.route("/callback/google")
def callback_google():
    # Boilerplate for handling the callback
    # code = request.args.get("code")
    # Exchange code for token, verify token, register/login user, and issue JWT
    
    return jsonify({"message": "Handle Google OAuth Callback here"})
