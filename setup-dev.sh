#!/bin/bash

echo "🚀 Setting up GuardTech Development Environment"
echo ""

# Backend Setup
echo "📦 Setting up Backend (Python)..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your Supabase credentials"
fi

cd ..

# Frontend Setup
echo ""
echo "📦 Setting up Frontend (Next.js)..."
cd frontend

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from example..."
    cp .env.local.example .env.local
    echo "⚠️  Please update frontend/.env.local with your Supabase credentials"
fi

cd ..

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your Supabase database URL and keys"
echo "2. Update frontend/.env.local with your Supabase project details"
echo "3. Run 'npm run start:backend' to start the backend server"
echo "4. Run 'npm run start:frontend' to start the frontend development server"
echo ""
echo "Or use 'npm run dev' to start both simultaneously"
