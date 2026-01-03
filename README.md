# GuardTech - Smart City Surveillance & Incident Management

A scalable, event-driven platform for civic incident reporting with AI-powered processing, real-time monitoring, and official governance dashboard. Built with FastAPI, Next.js, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account (free tier works!)
- Optional: Docker & Docker Compose for containerized deployment

### Development Setup (Recommended)

**Fast Setup:**
```bash
# Clone repository
git clone https://github.com/MiCodes2/GuardTech.git
cd GuardTech

# Run quick start script
chmod +x quickstart.sh
./quickstart.sh
```

**Manual Setup:**
1. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```

2. Update with your Supabase credentials (see [DEV_SETUP.md](DEV_SETUP.md))

3. Install dependencies:
   ```bash
   # Backend
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ..
   
   # Frontend
   cd frontend
   npm install
   cd ..
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

📚 **Detailed Setup Guide**: See [DEV_SETUP.md](DEV_SETUP.md) for complete instructions  
🔥 **Quick Reference**: See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common commands

### Docker Deployment (Alternative)

```bash
# Start all services with Docker
docker-compose up --build

# Check status
docker-compose ps
```

## 📋 Services & Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Next.js Frontend** | 3041 | http://localhost:3041 | Web application |
| **FastAPI Backend** | 8000 | http://localhost:8000 | REST API |
| **API Documentation** | 8000 | http://localhost:8000/docs | Interactive API docs |
| **Supabase** | - | Your project URL | Database, Auth, Storage |
| **Redis** (optional) | 6379 | `redis://localhost:6379` | Cache & queues |

## 🏗️ Architecture

### System Components
- **Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS
- **Backend**: FastAPI with async/await, SQLAlchemy, Pydantic
- **Database**: Supabase (PostgreSQL) with PostGIS for geospatial data
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage for media files
- **Real-time**: Supabase Realtime for live updates
- **Worker**: Celery for async AI/ML processing (optional)
- **AI/ML**: OpenAI GPT, PyTorch, Transformers
- **Database**: PostgreSQL with PostGIS for spatial data
- **Storage**: AWS S3 for images (configured)
- **AI**: OpenCV/YOLO for image processing, LLM for verification

### Data Flow
1. Citizen uploads photo via Next.js app
2. FastAPI receives request and queues job to Redis
3. Celery worker picks up job and processes with AI
4. Validated data stored in PostgreSQL
5. Real-time updates sent via WebSocket

## 📊 Database Schema

### Core Tables
- **incidents**: Raw report data with GPS coordinates
- **ai_analysis**: AI processing results and confidence scores
- **audit_log**: Complete audit trail of all status changes

### Sample Data
```sql
-- Database: civicop
-- User: civicop_user
-- Password: civicop_pass
```

## 🔧 API Endpoints

### Base URL: http://localhost:8040/api/v1

- `GET /incidents` - List all incidents
- `GET /incidents/{id}` - Get specific incident
- `POST /incidents` - Create new incident report

### API Documentation
Visit http://localhost:8040/docs for interactive API documentation.

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up postgres -d
docker-compose up redis -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate
```

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://civicop_user:civicop_pass@localhost:5440/civicop

# Redis
REDIS_URL=redis://localhost:6389/0

# AWS S3 (for image storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=civicop-images

# API
SECRET_KEY=your-secret-key-here

# Optional: Theme colors (also add client vars to frontend/.env.local)
THEME_CITY=#F9A825
THEME_WATER=#3B99D9
THEME_TRANSPORT=#D32F2F
THEME_GREEN=#388E3C
THEME_BG=#FFFFFF
```

On the frontend, create `frontend/.env.local` with public vars to expose to the browser:

```env
NEXT_PUBLIC_THEME_CITY=#F9A825
NEXT_PUBLIC_THEME_WATER=#3B99D9
NEXT_PUBLIC_THEME_TRANSPORT=#D32F2F
NEXT_PUBLIC_THEME_GREEN=#388E3C
NEXT_PUBLIC_THEME_BG=#FFFFFF
```

## 🧪 Testing

```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

## 🚀 Deployment

### Production Setup
1. Configure environment variables
2. Set up AWS S3 bucket
3. Configure domain and SSL
4. Deploy using Docker Compose
5. Set up monitoring and logging

### Scaling
- Use Redis cluster for high availability
- Scale Celery workers based on load
- Implement database read replicas
- Use CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please open an issue on GitHub.