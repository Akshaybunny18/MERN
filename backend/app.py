import os
from datetime import datetime
import strawberry
from flask import Flask
from strawberry.flask.views import GraphQLView
from flask_cors import CORS
from prometheus_client import Counter, generate_latest
from prometheus_client import CONTENT_TYPE_LATEST

from gql.queries import Query
from gql.mutations import Mutation
from database import db
from auth.routes import auth_bp
from auth.utils import hash_password
from config import get_root_admin_config
from services.catalog_service import seed_default_catalog

app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp)

REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP Requests"
)

schema = strawberry.Schema(query=Query, mutation=Mutation)

@app.before_request
def before():
    REQUESTS.inc()


@app.route("/")
def home():
    collections = db.list_collection_names()

    return {
        "status": "connected",
        "collections": collections
    }

@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {
        "Content-Type": CONTENT_TYPE_LATEST
    }

from middleware.auth import get_context

# Add Strawberry GraphQL endpoint
app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view("graphql_view", schema=schema, get_context=get_context)
)


def ensure_root_admin():
    admin_config = get_root_admin_config()
    admin_email = admin_config["email"]
    if not admin_email:
        return

    users = db["users"]
    now = datetime.utcnow()
    root_admin = users.find_one({"email": admin_email})
    admin_document = {
        "first_name": admin_config["first_name"],
        "last_name": admin_config["last_name"],
        "name": f"{admin_config['first_name']} {admin_config['last_name']}".strip(),
        "email": admin_email,
        "password_hash": hash_password(admin_config["password"]),
        "participant_type": "non_iiit",
        "college_org_name": "System",
        "contact_number": "",
        "provider": "local",
        "verified": True,
        "role": "admin",
        "interests": [],
        "followed_clubs": [],
        "bio": "Root administrator account provisioned by the server.",
        "created_at": root_admin.get("created_at") if root_admin else now,
        "updated_at": now,
    }

    if root_admin:
        users.update_one({"_id": root_admin["_id"]}, {"$set": admin_document})
    else:
        users.insert_one(admin_document)


ensure_root_admin()
seed_default_catalog()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)