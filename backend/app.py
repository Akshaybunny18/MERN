import strawberry
from flask import Flask
from strawberry.flask.views import GraphQLView
from prometheus_client import Counter, generate_latest
from prometheus_client import CONTENT_TYPE_LATEST

from gql.queries import Query
from gql.mutations import Mutation
from database import db
from auth.routes import auth_bp

app = Flask(__name__)
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)