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

4. **Database Setup:**
   - Create a Supabase project at https://supabase.com
   - Copy the entire contents of `supabase/schema.sql` into the Supabase SQL Editor
   - Execute the script
   - See [Database Migration Guide](supabase/MIGRATION_GUIDE.md) for details

5. **Environment Configuration:**
   Create `.env` files with your Supabase credentials:
   - **Backend:** `backend/.env`
   - **Frontend:** `frontend/.env.local`

6. **Start Servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev  # Runs on http://localhost:3000
   ```

### Using Docker Compose

```bash
docker-compose up -d
```

This starts:
- **Backend API:** http://localhost:8000
- **Frontend App:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

## 📦 Project Structure

```
GuardTech/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── core/        # Configuration & security
│   └── requirements.txt
├── frontend/            # Next.js application
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── lib/            # Utilities & API clients
│   └── styles/         # Global styles
├── worker/             # Celery background tasks
├── supabase/           # Database migrations
└── docker-compose.yml  # Container orchestration
```

## 📊 Database Schema (Supabase)

### Main Tables
- **civic_issues** - Anonymous civic issue reports
- **users** - User accounts (citizen/official/admin roles)
- **wards** - City ward/location reference data
- **ai_analysis** - AI analysis results for detected issues
- **audit_logs** - Audit trail of all system changes

### Storage
- **civic-issue-images** bucket - Issue images (max 5MB per file)

## 🔧 API Endpoints

```
GET    /api/v1/incidents           List all civic issues
POST   /api/v1/incidents           Submit new civic issue
GET    /api/v1/incidents/{id}      Get issue details
PUT    /api/v1/incidents/{id}      Update issue
GET    /api/v1/users               List users (admin only)
POST   /api/v1/users               Create new user
GET    /api/v1/governance/stats    Get governance statistics
```

Full OpenAPI docs available at: http://localhost:8000/docs

## 🎯 Features

### Backend
- ✅ FastAPI REST API with async support
- ✅ Supabase PostgreSQL integration with RLS
- ✅ Real-time WebSocket updates
- ✅ Celery background task processing
- ✅ AI/ML analysis pipeline
- ✅ Row-level security for data isolation
- ✅ File upload with storage integration

### Frontend
- ✅ Next.js with server-side rendering
- ✅ Real-time data sync via Supabase
- ✅ Interactive geospatial mapping
- ✅ Issue submission & tracking
- ✅ Admin governance dashboard
- ✅ Responsive design (mobile-first)
- ✅ Authentication & authorization

## 🔐 Security

- **Row Level Security (RLS)** - Fine-grained access control
- **Authentication** - JWT tokens for API access
- **Public Anonymous Submissions** - No login required for issue reporting
- **Password Hashing** - Industry-standard encryption
- **Image Validation** - File size and type restrictions
- **CORS Protection** - Cross-origin request filtering

## 📝 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host/database
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3041
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📦 Tech Stack

**Backend:**
- FastAPI (async Python web framework)
- SQLAlchemy (ORM)
- Supabase (PostgreSQL database)
- PostGIS (geospatial queries)
- Celery (task queue)
- Redis (caching & message broker)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Supabase Client (real-time database)
- Leaflet (interactive maps)

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL + PostGIS
- Nginx (reverse proxy)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment Options
- **Vercel** (Frontend)
- **Railway/Render/Fly.io** (Backend)
- **Supabase** (Database)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

- **API Documentation:** http://localhost:8000/docs
- **Issue Tracker:** GitHub Issues
- **Code Comments:** See inline documentation

## 🎯 Project Roadmap

- ✅ Core CRUD operations
- ✅ Real-time features
- ✅ Governance dashboard
- ⏳ Advanced analytics
- ⏳ Mobile app (iOS/Android)
- ⏳ ML model improvements
- ⏳ Email notifications

---

**Last Updated:** January 3, 2026  
**Version:** 1.0.0  
**Status:** Active Development

