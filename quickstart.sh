#!/bin/bash

echo "🚀 GuardTech Quick Start"
echo "======================="
echo ""

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found!"
    echo "📝 Creating from example..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env with your Supabase credentials"
    echo "   Required:"
    echo "   - DATABASE_URL"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_KEY"
    echo ""
    read -p "Press Enter when you've updated backend/.env..."
fi

# Check if .env.local exists in frontend
if [ ! -f "frontend/.env.local" ]; then
    echo "❌ Frontend .env.local file not found!"
    echo "📝 Creating from example..."
    cp frontend/.env.local.example frontend/.env.local
    echo ""
    echo "⚠️  IMPORTANT: Edit frontend/.env.local with your Supabase credentials"
    echo "   Required:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    read -p "Press Enter when you've updated frontend/.env.local..."
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend setup
echo "Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend
npm install
cd ..

# Root dependencies for concurrently
echo ""
echo "Installing development tools..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up your Supabase database:"
echo "   - Go to your Supabase project"
echo "   - Open SQL Editor"
echo "   - Run the SQL from: supabase/schema.sql"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "   Or start them separately:"
echo "   Terminal 1: npm run start:backend"
echo "   Terminal 2: npm run start:frontend"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3041"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📚 For detailed documentation, see DEV_SETUP.md"
echo ""
