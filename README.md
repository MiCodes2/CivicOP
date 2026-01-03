# GuardTech - Smart City Surveillance & Incident Management

A scalable, event-driven platform for civic incident reporting with AI-powered processing, real-time monitoring, and official governance dashboard. Built with FastAPI, Next.js, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Supabase account (free tier works!)
- Docker & Docker Compose (optional)

### Setup

1. **Clone & Install:**
   ```bash
   git clone https://github.com/MiCodes2/GuardTech.git
   cd GuardTech
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration:**
   - Backend: `/workspaces/GuardTech/backend/.env` (Supabase credentials included)
   - Frontend: `/workspaces/GuardTech/frontend/.env.local` (Supabase credentials included)

5. **Start Servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev  # Runs on http://localhost:3000
   ```

## 📦 What's Included

### Database Schema (Supabase)
- **civic_issues** - Anonymous issue reporting (main table)
- **users** - User accounts (citizen/official/admin)
- **wards** - City ward/location data
- **ai_analysis** - AI analysis results
- **audit_logs** - Audit trail
- **Storage** - `civic-issue-images` bucket (5MB per file)

### Backend Features
- FastAPI REST API
- Supabase PostgreSQL integration
- Row Level Security (RLS) for data protection
- WebSocket support for real-time updates
- Task scheduling with Celery
- AI/ML processing pipeline

### Frontend Features
- Next.js with TypeScript
- Real-time data fetching with Supabase
- Interactive maps with location tracking
- Issue submission & tracking
- Admin dashboard
- Responsive design with Tailwind CSS

## 🔧 API Endpoints

```
GET    /api/v1/incidents          - List all civic issues
POST   /api/v1/incidents          - Submit new issue
GET    /api/v1/incidents/{id}     - Get issue details
PUT    /api/v1/incidents/{id}     - Update issue
GET    /api/v1/incidents/{id}/ai  - Get AI analysis
```

## 🗄️ Database Schema

**civic_issues table:**
- `id` (UUID) - Unique identifier
- `title` (TEXT) - Issue title
- `description` (TEXT) - Detailed description
- `category` (TEXT) - Issue category
- `severity` (INTEGER 1-5) - Severity level
- `status` (TEXT) - OPEN/IN_PROGRESS/RESOLVED/CLOSED
- `latitude/longitude` (DOUBLE) - Location
- `address` (TEXT) - Full address
- `image_url` (TEXT) - URL of uploaded image
- `created_at/updated_at` (TIMESTAMP) - Timestamps
- `location` (GEOGRAPHY) - PostGIS geospatial data

**users table:**
- `id` (UUID) - Unique identifier
- `email` (VARCHAR) - Email (unique)
- `hashed_password` (VARCHAR) - Encrypted password
- `full_name` (VARCHAR) - User's name
- `role` (VARCHAR) - citizen/official/admin
- `is_active` (BOOLEAN) - Account status

## 🔐 Security

- Row Level Security (RLS) on all tables
- Public anonymous issue submission
- Authenticated user features
- Admin-only actions
- Image storage with size limits
- Secure password hashing

## 📝 Configuration

### Backend .env
```
SUPABASE_URL=https://pzopyqzogbumlvjmtecw.supabase.co
SUPABASE_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
DATABASE_URL=postgresql://postgres...
```

### Frontend .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://pzopyqzogbumlvjmtecw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## 🚀 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

Starts:
- Backend on http://localhost:8000
- Frontend on http://localhost:3000
- Nginx on http://localhost:80

### Manual Deployment
See deployment guides in your hosting provider documentation.

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

- Issue Tracker: GitHub Issues
- Documentation: See inline code comments
- API Docs: http://localhost:8000/docs (when backend is running)

## 🎯 Project Status

✅ Schema & Database Setup
✅ Backend API
✅ Frontend Application
✅ Real-time Features
✅ Storage Integration
⏳ Advanced Analytics
⏳ Mobile App

## 📚 Tech Stack

**Backend:**
- FastAPI (Python)
- Supabase (PostgreSQL)
- PostGIS (Geospatial)
- Celery (Task Queue)
- Redis (Caching)

**Frontend:**
- Next.js (React)
- TypeScript
- Tailwind CSS
- Supabase Client
- Leaflet Maps

**Infrastructure:**
- Docker
- Docker Compose
- Nginx
- GitHub Actions (CI/CD)

---

**Last Updated:** January 3, 2026
**Version:** 1.0.0
