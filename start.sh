#!/bin/bash
# Quick Start Script - Student Housing MVP
# This script sets up and runs both frontend and backend

echo "======================================"
echo "🏠 Student Housing MVP - Quick Start"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Start Backend
echo -e "${YELLOW}Starting Backend...${NC}"
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Starting backend server on port 5000..."
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo ""

# Start Frontend
echo -e "${YELLOW}Starting Frontend...${NC}"
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend server on port 3000..."
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}======================================"
echo "✅ Both servers are running!"
echo "======================================"
echo ""
echo -e "${GREEN}Frontend: ${NC}http://localhost:3000"
echo -e "${GREEN}Backend:  ${NC}http://localhost:5000"
echo ""
echo -e "${YELLOW}Test Credentials:${NC}"
echo "  Student: karim@example.com / student123456"
echo "  Owner:   ahmed@example.com / owner123456"
echo "  Admin:   admin@example.com / admin123456"
echo ""
echo -e "${YELLOW}Dashboards:${NC}"
echo "  Student: http://localhost:3000/dashboard/student"
echo "  Owner:   http://localhost:3000/dashboard/owner"
echo "  Admin:   http://localhost:3000/dashboard/admin"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop servers${NC}"
echo ""

# Register cleanup trap before waiting so Ctrl+C will stop child processes
trap 'echo "\nStopping servers..."; [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true; [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true; exit 0' SIGINT SIGTERM EXIT

# Wait for backgrounded processes
wait
