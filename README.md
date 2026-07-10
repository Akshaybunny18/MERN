# MERN Stack Event Management System

This project is a complete MERN stack application featuring Role-Based Access Control, custom event registration, Dynamic Forms, and Observability.

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
   ```
   *The backend will run on `http://localhost:5000`.*

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

## 🔑 Admin Provisioning
The system automatically provisions the first Admin account when the backend starts.
- **Email:** `admin@system.local`
- **Password:** `adminpassword`

Organizers cannot self-register. You must use the Admin account to provision Organizer roles.

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
