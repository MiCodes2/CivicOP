# CivicOp - Civic Issue Reporting Platform

A scalable, event-driven platform for citizens to report civic issues with AI-powered processing and official governance dashboard.

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (optional, can use Docker)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd GuardTech
```

### 2. Environment Setup
```bash
# Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Troubleshooting: If you see "email-validator is not installed" when starting the backend, run:
# pip install -r backend/requirements.txt
# or
# pip install email-validator

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Start Services

#### Option A: Docker Compose (Recommended)
```bash
# Start all services
docker-compose up --build -d

# Check status
docker-compose ps
```

#### Option B: Local Development
```bash
# Terminal 1: Start PostgreSQL (if not using Docker)
# PostgreSQL should be running on port 5440

# Terminal 2: Start Backend
source .venv/bin/activate
PYTHONPATH=/home/dell/mithilesh/GuardTech/backend uvicorn app.main:app --host 0.0.0.0 --port 8040 --reload

# Terminal 3: Start Frontend
cd frontend && npm run dev

# Terminal 4: Start Redis (if needed)
redis-server
```

## 📋 Services & Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **PostgreSQL** | 5440 | `postgresql://civicop_user:civicop_pass@localhost:5440/civicop` | Database with PostGIS |
| **FastAPI Backend** | 8040 | http://localhost:8040 | REST API |
| **Next.js Frontend** | 3040 | http://localhost:3040 | Citizen web app |
| **Redis** | 6389 | `redis://localhost:6389/0` | Message queue |
| **API Gateway** | 80 | http://localhost:80 | Nginx proxy |

## 🏗️ Architecture

### System Components
- **Frontend**: Next.js PWA for citizen mobile/web app
- **Backend**: FastAPI for REST API with automatic OpenAPI docs
- **Worker**: Celery for async AI processing
- **Queue**: Redis for message queuing
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