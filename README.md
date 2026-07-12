# Infinium: Campus Event & Merchandise Management System

infinium-fest.vercel.app

**Infinium** is a comprehensive, enterprise-grade MERN stack platform designed specifically for university campuses to streamline event registrations, club merchandise sales, and participant tracking. It features a robust Role-Based Access Control (RBAC) system for Admins, Organizers (Clubs), and Participants, dynamic custom forms, automated event lifecycle management, and real-time observability via Grafana. Built with a focus on beautiful UI/UX, seamless performance using Redis caching, fault-tolerant cloud architecture, Kubernetes (K8s) orchestration, and implemented JWT and Bcrypt for secure authentication and password management.

---

## 🔑 Test Credentials
To easily evaluate the platform, you can log in using any of the following pre-provisioned accounts to verify the different role functionalities:

**1. Admin Account**
- **Email:** `admin@system.local`
- **Password:** `adminpassword`
- **Capabilities:** Provision new Organizers, view system-wide stats, and manage password reset requests.

**2. Organizer Account (Club)**
- **Email:** `programmingclub@iiit.ac.in` (Or any seeded club email)
- **Password:** `Programming Club@123`
- **Capabilities:** Create events, manage merchandise stock, and view participant analytics.

**3. Participant Account (Student)**
- **Email:** `hi@iiit.ac.in`
- **Password:** `12345678`
- **Capabilities:** Browse events, register for contests, purchase merch, and view ticket QR codes. *(Note: Anyone can also self-register a new participant account directly from the signup page).*



## 📈 Grafana Cloud Observability

This project exposes secure Prometheus metrics to be scraped by Grafana Cloud (using the Metrics Endpoint integration).

**Connection Details:**
- **Metrics URL:** `https://mern-cqqz.onrender.com/metrics`
- **Authentication Type:** Basic
- **Username:** `admin`
- **Password:** `admin`

*(Note: The `/metrics` route is explicitly secured with basic authentication in `server.js` to prevent unauthorized public access).*

---


## 🚀 How to Run (Using Docker) - Recommended

The easiest way to run the entire stack (Frontend, Backend, MongoDB, Nginx Proxy, Prometheus, Grafana) is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed.

### Steps
1. Open your terminal in the root directory (where `docker-compose.yml` is located).
2. Build and start the containers:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application:
   - **Frontend UI:** `http://localhost` (Served via Nginx Reverse Proxy)
   - **Backend API:** `http://localhost/api` (Proxied to backend)
   - **Prometheus Metrics:** `http://localhost:9090` (Scraping backend metrics)
   - **Grafana Dashboard:** `http://localhost:3000` (Login: `admin` / `admin`)
   - **Redis Cache:** Running internally on port `6379`

4. To stop the application:
   ```bash
   docker-compose down
   ```

---

## 💻 How to Run (Without Docker)

If you prefer to run the application locally for development, you will need Node.js and MongoDB installed on your system.

### Prerequisites
- Node.js (v18+)
- Local MongoDB instance running on `mongodb://localhost:27017`

### 1. Start the Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   # Or use 'node server.js'
   *The backend will run on `http://localhost:5000`.*

   > **Troubleshooting `ECONNREFUSED` Redis Errors:**
   > Because the backend expects a Redis cache, running `npm start` locally without a Redis server will cause `ECONNREFUSED 127.0.0.1:6379` errors in the console. The server will still run and fall back to MongoDB, but to fix the logs, either run the whole stack via Docker Compose, or start a local Redis container in the background:
   > ```bash
   > docker run --name local-redis -p 6379:6379 -d redis:7-alpine
   > ```

### 2. Start the Frontend
1. Open a **new** terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

> **Note:** The frontend uses Vite's built-in proxy (configured in `vite.config.js`) to automatically route `/api` requests to `http://localhost:5000` during local development, mirroring the Nginx setup!

---

## 🚀 Cloud Deployment Guide

This project is fully ready to be deployed to free cloud providers (Vercel, Render, MongoDB Atlas, Upstash).

### Render (Backend) Environment Variables
When deploying the Node.js backend to Render, add the following Environment Variables:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `MONGO_URI` | `mongodb+srv://akshaybunny18:akshay123@cluster...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `any_random_text_you_want_like_super_secret_key` | Secret key for signing authentication tokens |
| `REDIS_URI` | `rediss://default:gQAAAAAAAUF-AAIgcDE...` | Your Upstash Redis connection string (Optional) |
| `FRONTEND_URL` | `https://infinium-fest.vercel.app` | The live URL of your deployed React app |

*Note on Redis:* The backend is designed to be **fault-tolerant**. If you do not provide a `REDIS_URI`, the server will print a warning (`No REDIS_URI provided. Running without Redis cache.`) and will continue to work perfectly fine by querying MongoDB directly!

### Vercel (Frontend) Environment Variables
No environment variables are strictly required for Vercel because we configured a `vercel.json` rewrite rule that automatically routes `/api` requests to your live Render backend URL! However, if you didn't use `vercel.json`, you would set:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `VITE_BACKEND_URL` | `https://mern-cqqz.onrender.com` | The live URL of your deployed Render Node.js backend |

---
## 🐋 Docker vs Local Routing (The Port Issue)
Previously, the frontend `vite.config.js` was hardcoded to proxy `/api` requests to `http://localhost:5000`. 
- **The Problem:** This works perfectly when running locally on your laptop, but when running inside Docker, `localhost` refers to the *frontend container itself*, not the backend container.
- **The Solution:** We updated `vite.config.js` to use `process.env.BACKEND_URL || 'http://localhost:5000'`. In our `docker-compose.yml`, we explicitly set `BACKEND_URL=http://backend:5000`. This allows the app to seamlessly switch between Docker routing and local routing without any code changes!

---

## 🛠️ Technology Stack & Architecture
We have fully implemented the core architecture and documented the current technology stack choices, libraries, and advanced deployment options in [Tech_Stack.md](./Tech_Stack.md). 

**Key Choices Justified:**
- **MongoDB**: Used for flexible schema design (custom event forms and participant profiles vary heavily).
- **Express + Node.js**: Fast, non-blocking I/O ideal for handling multiple registration requests during high-traffic events.
- **React + Tailwind CSS**: Component-based architecture for dynamic forms. Tailwind allows for rapid, consistent styling without heavy external libraries.
- **JWT & Bcrypt**: Essential for stateless authentication and secure credential storage.
- **Redis**: In-memory caching for faster event queries and reducing database load.
- **Kubernetes (K8s)**: Deployment manifests are available in the `k8s/` directory for deploying the full stack to any cluster.

## 🌟 Advanced Features Implemented (Tier B)
As per the assignment requirements (Section 13), we chose to implement features from **Tier B**:
1. **Organizer Password Reset Workflow**: Fully implemented with an Admin approval dashboard, secure reason tracking, auto-generation of strong passwords, and history tracking. Justification: Crucial for an event management system where clubs rotate leadership annually and frequently lose access to accounts.

*More advanced features from Tier A (e.g. Merchandise Approval, Team Chat) can be built upon this extensible foundation!*
