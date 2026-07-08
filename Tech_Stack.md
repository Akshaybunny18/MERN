# Tech Stack

## Frontend

- React 18
- Vite
- Tailwind CSS via CDN
- react-router-dom available for routing support

## Backend

- Flask
- Strawberry GraphQL
- PyMongo
- JWT authentication with PyJWT
- bcrypt password hashing
- Flask-CORS for browser access

## Data

- MongoDB
- Seeded collections for users, clubs, events, and password reset requests

## Infrastructure

- Docker
- Docker Compose
- Nginx reverse proxy
- Prometheus metrics endpoint

## Observability

- Prometheus
- Grafana

## Notes

- Admin access is server-provisioned as a root account.
- IIIT participant emails must end in `iiit.ac.in`.
- Tailwind is enabled through the frontend HTML shell, not through a package build step.