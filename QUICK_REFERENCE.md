# GuardTech - Quick Reference

## Starting Development

```bash
# Quick start (first time)
chmod +x quickstart.sh
./quickstart.sh

# Start both services
npm run dev

# Or individually
npm run start:backend   # Backend on :8000
npm run start:frontend  # Frontend on :3041
```

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_KEY=[ANON-KEY]
SECRET_KEY=change-me-in-production
```

### Frontend `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL from `supabase/schema.sql` in SQL Editor
3. Copy credentials to `.env` files
4. Done!

## Key Files

- `backend/app/main.py` - FastAPI app entry
- `backend/app/core/config.py` - Configuration
- `backend/app/core/supabase.py` - Supabase client
- `frontend/lib/supabase.ts` - Frontend Supabase client
- `frontend/lib/api.ts` - API client
- `supabase/schema.sql` - Database schema

## API Endpoints

- `GET /api/v1/incidents` - List incidents
- `POST /api/v1/incidents` - Create incident
- `GET /api/v1/users` - List users
- `POST /api/v1/auth/login` - Login
- Full docs: http://localhost:8000/docs

## Common Commands

```bash
# Install dependencies
npm run install:backend
npm run install:frontend

# Activate Python venv
cd backend && source venv/bin/activate

# Run migrations (if using Alembic)
cd backend && alembic upgrade head

# Build frontend
npm run build:frontend

# Lint frontend
npm run lint:frontend
```

## Troubleshooting

**Backend won't start:**
- Check DATABASE_URL in backend/.env
- Verify Python venv is activated
- Run: `pip install -r backend/requirements.txt`

**Frontend won't start:**
- Delete node_modules and reinstall: `cd frontend && rm -rf node_modules && npm install`
- Check .env.local exists

**Database connection:**
- Verify Supabase credentials
- Check if SQL schema is loaded
- Test connection in Supabase dashboard

## Learn More

- Full setup: `DEV_SETUP.md`
- FastAPI: https://fastapi.tiangolo.com
- Next.js: https://nextjs.org
- Supabase: https://supabase.com/docs
