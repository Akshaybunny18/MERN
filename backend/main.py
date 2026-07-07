from flask import Flask
from prometheus_client import Counter, generate_latest
from prometheus_client import CONTENT_TYPE_LATEST

app = Flask(__name__)

REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP Requests"
)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)