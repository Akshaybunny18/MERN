# Technology Stack & Architecture

This document outlines the core technologies, libraries, and architectural decisions powering the Infinium platform.

## Core Infrastructure

1. **MongoDB**: Utilized as the primary database for flexible schema design, allowing dynamic event custom forms and extensible participant profiles.
2. **Express.js & Node.js**: Provides a fast, non-blocking I/O backend environment ideal for handling concurrent registration requests during high-traffic campus events.
3. **React.js (Vite)**: Component-based frontend architecture ensuring a highly responsive single-page application experience.
4. **Tailwind CSS**: A utility-first CSS framework used for rapid, responsive, and consistent UI styling without the overhead of heavy external component libraries.

## Security & Authentication

1. **JSON Web Tokens (JWT)**: Implemented for secure, stateless user authentication and session management across the platform.
2. **Bcrypt**: Cryptographic hashing algorithm used to securely salt and hash passwords for all Participants, Organizers, and Admins prior to database storage.
3. **Role-Based Access Control (RBAC)**: Strict middleware validation ensuring logical separation of capabilities between Admins, Organizers, and Participants.

## Performance & Observability

1. **Upstash Redis**: In-memory caching layer implemented to store high-frequency event queries, drastically reducing MongoDB load. The system features a fault-tolerant fallback mechanism if the Redis cluster is unreachable.
2. **Prometheus**: The Node.js backend exposes a dedicated `/metrics` endpoint (secured via Basic Authentication) to broadcast live application performance data.
3. **Grafana**: Integrated to aggregate and visualize the time-series metrics collected by Prometheus.

## Deployment & Orchestration

1. **Docker & Docker Compose**: The entire stack (Frontend, Backend, MongoDB, Nginx, Prometheus, Grafana) is containerized for consistent local development and isolated deployments.
2. **Nginx**: Configured as a reverse proxy within the Docker network to serve the frontend and route `/api` traffic seamlessly.
3. **Kubernetes (K8s)**: Production-ready deployment manifests (Deployments, Services) are provided in the `k8s/` directory to orchestrate containers at scale.
4. **Vercel & Render**: Native support for edge CDN deployment of the React frontend via Vercel, and optimized Web Service deployment of the backend via Render.
5. **CI/CD Readiness**: The containerized architecture is designed to seamlessly integrate with GitHub Actions for automated testing, image building, and deployment rollouts.

## Background Services

1. **Nodemailer**: Integrated with Ethereal Email for automated, non-blocking background processing of ticket confirmation emails and QR codes.
