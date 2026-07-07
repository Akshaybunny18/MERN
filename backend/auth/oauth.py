import os

# Boilerplate for future OAuth integration
# You can use Authlib or requests to handle Google/GitHub OAuth flows

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

def get_google_provider_cfg():
    import requests
    try:
        return requests.get(GOOGLE_DISCOVERY_URL).json()
    except Exception:
        return None

def verify_oauth_token(token: str) -> dict:
    # TODO: Verify token with provider
    pass
