# 🎯 GuardTech Setup Checklist

Use this checklist to ensure your development environment is properly configured.

## ✅ Prerequisites

- [ ] Python 3.11+ installed (`python3 --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor (VS Code recommended)

## ✅ Supabase Setup

- [ ] Created Supabase account at [supabase.com](https://supabase.com)
- [ ] Created new Supabase project
- [ ] Copied project URL (Settings → API)
- [ ] Copied anon/public key (Settings → API)
- [ ] Copied service role key (Settings → API) - keep this secret!
- [ ] Copied database password (Settings → Database → Connection String)
- [ ] Ran SQL schema from `supabase/schema.sql` in SQL Editor
- [ ] Verified tables were created (Table Editor)
- [ ] Created storage buckets: `incident-media` and `user-avatars`

## ✅ Backend Setup

- [ ] Navigated to `backend/` directory
- [ ] Created `.env` file from `.env.example`
- [ ] Updated `DATABASE_URL` with Supabase connection string
- [ ] Updated `SUPABASE_URL` with project URL
- [ ] Updated `SUPABASE_KEY` with anon key
- [ ] Updated `SUPABASE_SERVICE_KEY` with service role key
- [ ] Generated new `SECRET_KEY` (use: `openssl rand -hex 32`)
- [ ] Created Python virtual environment (`python3 -m venv venv`)
- [ ] Activated virtual environment (`source venv/bin/activate`)
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] No errors during installation

## ✅ Frontend Setup

- [ ] Navigated to `frontend/` directory
- [ ] Created `.env.local` file from `.env.local.example`
- [ ] Updated `NEXT_PUBLIC_SUPABASE_URL` with project URL
- [ ] Updated `NEXT_PUBLIC_SUPABASE_ANON_KEY` with anon key
- [ ] Ran `npm install`
- [ ] No errors during installation
- [ ] Created `lib/` directory
- [ ] Copied `lib/supabase.ts` and `lib/api.ts` files

## ✅ Root Project Setup

- [ ] Created `package.json` in root directory
- [ ] Ran `npm install` in root (for concurrently)
- [ ] Made shell scripts executable:
  ```bash
  chmod +x setup-dev.sh quickstart.sh
  ```

## ✅ Testing the Setup

### Backend Test
- [ ] Activated venv: `cd backend && source venv/bin/activate`
- [ ] Started backend: `uvicorn app.main:app --reload`
- [ ] Backend started without errors
- [ ] Opened http://localhost:8000/docs
- [ ] API documentation loads correctly
- [ ] Database connection successful (no errors in console)

### Frontend Test
- [ ] Started frontend: `cd frontend && npm run dev`
- [ ] Frontend started without errors
- [ ] Opened http://localhost:3041
- [ ] Page loads correctly
- [ ] No console errors in browser dev tools

### Integration Test
- [ ] Both backend and frontend running simultaneously
- [ ] Used `npm run dev` from root directory
- [ ] Can access both services
- [ ] Browser can communicate with API
- [ ] Supabase connection working (check Network tab)

## ✅ Supabase Database Verification

- [ ] Go to Supabase Table Editor
- [ ] Tables visible: users, incidents, ai_analysis, audit_logs, etc.
- [ ] Go to Storage
- [ ] Buckets created: incident-media, user-avatars
- [ ] Policies configured correctly

## ✅ Optional Components

### Redis (for caching/queuing)
- [ ] Redis installed (`redis-server --version`)
- [ ] Redis running (`redis-cli ping` returns PONG)
- [ ] Updated `REDIS_URL` in backend/.env

### OpenAI (for AI features)
- [ ] Created OpenAI account
- [ ] Generated API key
- [ ] Updated `OPENAI_API_KEY` in backend/.env

### AWS S3 (alternative storage)
- [ ] Created AWS account
- [ ] Created S3 bucket
- [ ] Generated access keys
- [ ] Updated AWS credentials in backend/.env

## ✅ Development Workflow

- [ ] Can start both services with `npm run dev`
- [ ] Hot reload works for backend (FastAPI auto-reload)
- [ ] Hot reload works for frontend (Next.js Fast Refresh)
- [ ] Changes reflect immediately
- [ ] No need to restart manually

## ✅ Git Setup

- [ ] Initialized git repository
- [ ] `.env` files NOT tracked (in .gitignore)
- [ ] `.env.example` files ARE tracked
- [ ] Committed initial setup

## 🎉 Ready to Develop!

If all items are checked, you're ready to start building!

### Next Steps:
1. Read through the code in `backend/app/` and `frontend/pages/`
2. Try creating a user through the API
3. Test the incident creation flow
4. Explore the Supabase dashboard
5. Start customizing for your needs

### Common Commands:
```bash
# Start development
npm run dev

# Backend only
npm run start:backend

# Frontend only
npm run start:frontend

# Install new backend package
cd backend && source venv/bin/activate && pip install <package>

# Install new frontend package
cd frontend && npm install <package>
```

### Useful Resources:
- FastAPI: https://fastapi.tiangolo.com
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

## ❌ Troubleshooting

### Backend won't start
- Check if Python venv is activated
- Verify DATABASE_URL in .env
- Run `pip install -r requirements.txt` again
- Check for port conflicts (8000)

### Frontend won't start
- Delete node_modules: `rm -rf node_modules && npm install`
- Check for port conflicts (3041)
- Verify .env.local exists

### Supabase connection issues
- Verify credentials are correct
- Check if Supabase project is active
- Ensure IP is not blocked (check Supabase dashboard)
- Test connection in Supabase SQL Editor

### Import errors
- Ensure all dependencies installed
- Check Python version (3.11+)
- Check Node version (18+)

Need help? Check DEV_SETUP.md or create an issue on GitHub.
