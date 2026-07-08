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
   - **Prometheus Metrics:** `http://localhost:9090`
   - **Grafana Dashboard:** `http://localhost:3000` (Login: `admin` / `admin`)

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
