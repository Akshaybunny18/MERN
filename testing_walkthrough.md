# Comprehensive Manual Testing Guide: Infinium (Felicity) Event Management System

This guide provides a step-by-step walkthrough to manually test every feature we've implemented, directly mapped to the requirements in your `Assignment_1-V3.pdf`. 

## Prerequisites
Make sure both servers are running:
- **Backend:** `cd backend && npm start` (runs on port 5000)
- **Frontend:** `cd frontend && npm run dev` (runs on port 5173)

---

## Part 1: Core System Implementation

### 3 & 4. User Roles, Authentication & Security
**Test 1: IIIT vs Non-IIIT Registration (Requirement 4.1.1)**
1. Go to `http://localhost:5173/register`
2. Try to register as an "IIIT Student" using a non-IIIT email (e.g., `test@gmail.com`). **Expected:** The frontend should block this and show an error about needing an IIIT domain.
3. Change the role to "Non-IIIT Participant" and use `test@gmail.com`. **Expected:** Registration succeeds.

**Test 2: Security & Routing (Requirement 4.2 & 4.3)**
1. Log out.
2. Try to navigate manually to `http://localhost:5173/dashboard` or `http://localhost:5173/organizer/dashboard`. 
3. **Expected:** You should be redirected back to the login page (Protected Routes).

### 5 & 6. User Onboarding & Models
**Test 3: Preferences (Requirement 5)**
1. Create a new Participant account.
2. Upon successful registration, you should be prompted to select **Areas of Interest** (Tech, Cultural, etc.) and **Clubs to Follow**.
3. Skip or save. Go to the **Profile** page from the Navbar.
4. **Expected:** You should see your saved preferences and be able to edit them.

### 11. Admin Features (Requirement 11)
**Test 4: Admin Login & Club Management**
1. Go to Login. Log in as the Admin (credentials from your `.env` or hardcoded `admin@iiit.ac.in` / `admin123`).
2. Go to **Manage Clubs**.
3. **Expected:** You should see the 41 clubs we seeded. You can create a new club here. When you create one, the system auto-generates the password and shows it to you. You can also delete/remove clubs.

### 10. Organizer Features & Navigation (Requirement 10)
**Test 5: Event Creation & Custom Forms (Requirement 10.4)**
1. Log in as one of the seeded clubs (e.g., `theartsociety@iiit.ac.in` | Password: `The Art Society@123`).
2. Click **Create Event**.
3. Fill in the basic details (Name, Type = Normal, Date, Limit). Click Next to save as **Draft**.
4. **Form Builder:** Add a custom field (e.g., "T-Shirt Size", type: Dropdown, Options: S, M, L).
5. Publish the event.

**Test 6: Organizer Dashboard & Analytics (Requirement 10.2 & 10.3)**
1. Go to the Organizer Dashboard.
2. **Expected:** You should see the Events Carousel showing your new event as "Published".
3. Click on the event to view the **Event Detail Page**. 
4. **Expected:** You should see Analytics (0 registrations so far) and an empty Participants list.

### 9. Participant Features & Navigation (Requirement 9)
**Test 7: Browse Events & Search (Requirement 9.3)**
1. Log in as a Participant.
2. Navigate to **Browse Events**.
3. **Expected:** You should see a Search bar, Filters (Event Type, Eligibility, Status), and a checkbox for "Followed Clubs Only". Test the search by typing the name of the event you just created.

**Test 8: Registration Workflow (Requirement 9.4 & 9.5)**
1. Click on the event you created.
2. Click **Register**. You should see the custom form ("T-Shirt Size") you built earlier.
3. Fill it out and submit.
4. Go to **Dashboard** -> **My Events**.
5. **Expected:** You should see this event listed in your Upcoming Events / Participation History with a clickable Ticket ID.

### 10.4 & 13.2 Event Editing Rules & Password Resets
**Test 9: Event Editing Lockout (Requirement 10.4 & Chat Request)**
1. Log back in as the Organizer (`theartsociety@iiit.ac.in`).
2. Go to the Event Detail page and click **Edit Event**.
3. **Expected:** Because a participant has registered, the "Registration Deadline" and "Max Participants" fields should be grayed out (disabled). A warning text will say "Core details are locked because this event has registered participants." You cannot delete it either (the Delete button is hidden).

**Test 10: Organizer Password Reset Workflow (Requirement 13.2 - Tier B)**
1. Log out. Go to the Login page.
2. Click **Forgot Password**.
3. Enter `theartsociety@iiit.ac.in` and type a Reason: "I forgot my password during the fest." Click Submit.
4. Log in as **Admin**.
5. Go to **Password Reset Requests** in the Navbar.
6. **Expected:** You will see the request from The Art Society.
7. Click **Approve**.
8. **Expected:** A modal will pop up showing the newly auto-generated secure password (e.g., `8x!9qBz`). 
9. Log out, and test logging in as the club using this new auto-generated password!

**Test 11: Admin Event Deletion (Chat Request)**
1. Log in as Admin.
2. Go to **Browse Events**.
3. **Expected:** Admin has a special **Delete** button on all event cards. *Note: If the event has > 0 registrations, clicking delete will result in an error from the backend protecting the data.*

### 9.6 Profile Page Updates
**Test 12: Confirm Password (Chat Request)**
1. Log in as any user (Participant or Organizer).
2. Navigate to **Profile**.
3. Scroll down to the Change Password section.
4. **Expected:** You must now enter a New Password AND a Confirm Password. Try typing mismatched passwords; the UI will prevent submission.

---
### Final Notes
By following this guide, you will verify every piece of the MERN stack is interacting correctly: MongoDB relationships, Express routing middleware (JWT verification), and React state management (Vite). Good luck with your assignment submission!

---
## Part 2: Enterprise Architecture (Caching, Observability, Kubernetes)

### 12. Redis Caching
**Test 13: Event List Caching**
1. Ensure the `redis` container is running via `docker-compose`.
2. Open your network tab in the browser or use Postman to hit `GET /api/events`.
3. The first request fetches data from MongoDB. The subsequent requests (within 60 seconds) will be served instantly from the Redis cache in memory.

### 13. Observability (Prometheus & Grafana)
**Test 14: Metrics Dashboard**
1. Ensure `prometheus` and `grafana` containers are running.
2. Go to `http://localhost:9090` (Prometheus) and verify it is scraping `backend:5000`.
3. Go to `http://localhost:3000` (Grafana). Log in with `admin` / `admin`.
4. Add Prometheus as a Data Source (`http://prometheus:9090`). You can now track API request durations, hits, and HTTP response codes exposed by the backend `/metrics` endpoint.

### 14. Kubernetes Deployment
**Test 15: K8s Manifests**
1. The `k8s/` directory contains `Deployment` and `Service` files for MongoDB, Redis, Backend, Frontend, and an `Ingress` controller.
2. To test locally (if Minikube/Docker Desktop Kubernetes is enabled), run:
   ```bash
   kubectl apply -f k8s/
   ```
3. Verify pods are running with `kubectl get pods`.
