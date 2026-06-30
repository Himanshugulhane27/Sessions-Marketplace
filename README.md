# Sessions Marketplace

A full-stack web application for discovering, creating, and booking sessions from talented creators. Built with Next.js, Django, PostgreSQL, and Docker.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (React, App Router) |
| **Backend** | Django 5 + Django REST Framework |
| **Database** | PostgreSQL 16 |
| **Reverse Proxy** | Nginx |
| **Auth** | Google OAuth 2.0 + JWT |
| **Containerization** | Docker + Docker Compose |

## 📁 Project Structure

```
/frontend        → Next.js app (React)
/backend         → Django project
  /accounts      → User model, auth, profile
  /sessions_app  → Session CRUD
  /bookings      → Booking management
/nginx           → Reverse proxy config
docker-compose.yml
.env.example
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- A Google Cloud OAuth Client ID (see below)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd sessions-marketplace
   ```

2. **Copy and configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in the required values (see Google OAuth setup below).

3. **Start all services with one command:**
   ```bash
   docker-compose up --build
   ```

4. **Access the app:**
   - Frontend: http://localhost (via Nginx)
   - API: http://localhost/api/
   - Django Admin: http://localhost/admin/

### Creating a Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **+ Create Credentials → OAuth client ID**
5. Choose **Web application**
6. Set:
   - **Name:** Sessions Marketplace (or whatever you prefer)
   - **Authorized JavaScript origins:**
     - `http://localhost`
     - `http://localhost:3000`
   - **Authorized redirect URIs:**
     - `http://localhost`
     - `http://localhost:3000`
7. Copy the **Client ID** and **Client Secret**
8. Paste them into your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

> **Note:** `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` should have the same value.

## 📝 Demo Flow

Here's how to test the full flow:

### As a User
1. Open http://localhost
2. Click **"Sign in with Google"** and authenticate
3. Browse the session catalog
4. Click on a session card to see details
5. Click **"Book Now"** to book a session
6. Go to **Dashboard** to see your active bookings

### As a Creator
1. Sign in with Google
2. Go to **Dashboard → Profile** tab
3. Click **"✨ Become a Creator"** to switch your role
4. Refresh the page — you'll see **"Creator Studio"** in the navbar
5. Go to **Creator Studio**
6. Click **"+ Create Session"** to create a new session
7. Fill in the details (title, description, price, date/time, capacity)
8. Your session will appear in the catalog for others to book!

> **Note:** For demo purposes, any user can switch to creator role from their profile settings. In production, this would require an approval process.

### Full Round-Trip
1. Sign in as User A → switch to creator → create a session
2. Sign in as User B (or use the same account) → browse catalog → book the session
3. Check User B's dashboard to see the booking
4. Check User A's Creator Studio to see the booking count

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google/` | Google OAuth login (send `credential` or `code`) |
| POST | `/api/auth/become-creator/` | Switch role to creator (authenticated) |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/` | Get current user profile |
| PATCH | `/api/profile/` | Update profile (name, avatar_url, role) |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions/` | List all sessions (public) |
| GET | `/api/sessions/:id/` | Session detail (public) |
| POST | `/api/sessions/` | Create session (creator only) |
| PATCH | `/api/sessions/:id/` | Update session (owner only) |
| DELETE | `/api/sessions/:id/` | Delete session (owner only) |
| GET | `/api/creator/sessions/` | Creator's sessions with booking counts |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/` | Create booking (authenticated) |
| GET | `/api/bookings/list/` | List user's bookings (?status=active\|past) |
| POST | `/api/bookings/:id/cancel/` | Cancel a booking |

## 🔒 Security

- **JWT Authentication:** All authenticated endpoints require `Authorization: Bearer <token>` header
- **Role-based permissions:** `IsCreator` and `IsOwnerOrReadOnly` custom permission classes
- **Rate limiting:** DRF throttling applied (100/hour anonymous, 1000/hour authenticated)
- **CORS:** Configured for development; restrict in production

## 🧪 Development

### Backend Only
```bash
docker-compose up backend db
```

### Frontend Only (if backend is running)
```bash
cd frontend
npm run dev
```

### Create Django Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 📄 License

MIT
