import strawberry
from flask import Flask
from strawberry.flask.views import GraphQLView
from prometheus_client import Counter, generate_latest
from prometheus_client import CONTENT_TYPE_LATEST

from backend.graphql.queries import Query
from backend.graphql.mutations import Mutation

app = Flask(__name__)

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
    return {"message": "Hello"}

@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {
        "Content-Type": CONTENT_TYPE_LATEST
    }

# Add Strawberry GraphQL endpoint
app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view("graphql_view", schema=schema)
)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)