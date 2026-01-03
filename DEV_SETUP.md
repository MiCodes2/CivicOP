# GuardTech - Development Setup

Smart City Surveillance & Incident Management Platform with Supabase Integration

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Supabase account (free tier works great!)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/MiCodes2/GuardTech.git
cd GuardTech

# Run the setup script
chmod +x setup-dev.sh
./setup-dev.sh
```

### 2. Supabase Configuration

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Set up Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Run the migration script in `supabase/schema.sql`

3. **Configure Environment Variables**

Backend (`.env`):
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_KEY=[YOUR-SERVICE-KEY]
SECRET_KEY=your-secret-key-change-this
```

Frontend (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### 3. Install Dependencies

#### Option A: Manual Installation

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

#### Option B: Using Root Package.json

```bash
npm run setup
```

### 4. Run the Application

#### Start Both Services Concurrently:
```bash
npm install  # Install concurrently
npm run dev
```

#### Or Start Separately:

**Backend (Terminal 1):**
```bash
npm run start:backend
# or manually:
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Terminal 2):**
```bash
npm run start:frontend
# or manually:
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3041
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Supabase Studio**: Your project dashboard URL

## Project Structure

```
GuardTech/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Config & security
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── .env                # Backend environment
│   └── requirements.txt
├── frontend/               # Next.js Frontend
│   ├── components/         # React components
│   ├── pages/              # Next.js pages
│   ├── lib/                # Utilities & helpers
│   │   ├── supabase.ts    # Supabase client
│   │   └── api.ts         # API client
│   ├── styles/
│   ├── .env.local          # Frontend environment
│   └── package.json
├── worker/                 # Celery worker for AI tasks
├── supabase/              # Database migrations
└── package.json           # Root package for scripts

```

## Key Features

### Backend (Python/FastAPI)
- RESTful API with FastAPI
- PostgreSQL database via SQLAlchemy
- Supabase integration for auth & storage
- Real-time WebSocket support
- AI/ML processing with Celery workers
- JWT authentication

### Frontend (Next.js/React)
- Server-side rendering with Next.js
- Supabase Auth integration
- Real-time updates via Supabase subscriptions
- Interactive maps with Leaflet
- Tailwind CSS styling
- TypeScript support

## Development Scripts

```bash
# Setup environment
npm run setup

# Start development servers
npm run dev                    # Both frontend & backend
npm run start:backend          # Backend only
npm run start:frontend         # Frontend only

# Install dependencies
npm run install:backend        # Backend dependencies
npm run install:frontend       # Frontend dependencies

# Build & lint
npm run build:frontend         # Build for production
npm run lint:frontend          # Lint frontend code
```

## Supabase Features Used

1. **Authentication**: User signup, login, session management
2. **Database**: PostgreSQL with PostGIS extension for geospatial data
3. **Storage**: File uploads for incident media
4. **Real-time**: Live incident updates across clients
5. **Row Level Security**: Fine-grained access control

## Database Schema

See `supabase/schema.sql` for the complete database schema including:
- Users table
- Incidents table with geospatial data
- AI analysis results
- Audit logs

## Troubleshooting

### Backend Issues

**Import errors:**
```bash
# Ensure virtual environment is activated
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

**Database connection:**
- Verify `DATABASE_URL` in backend/.env
- Check Supabase project status
- Ensure database password is correct

### Frontend Issues

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection:**
- Verify URLs and keys in frontend/.env.local
- Check browser console for errors
- Ensure Supabase project is active

## Optional: Redis for Caching

If you want to use Redis for caching and Celery:

```bash
# Install Redis
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Linux

# Start Redis
redis-server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/MiCodes2/GuardTech/issues
- Email: support@guardtech.example.com
