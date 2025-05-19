#!/bin/bash

# Start both FastAPI backend and React frontend

# Function to shutdown both processes
shutdown() {
  echo "Shutting down..."
  # Kill any background processes we started
  if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
  fi
  exit 0
}

# Trap SIGINT (Ctrl+C) and call shutdown
trap shutdown INT

# Kill any existing processes that might be using our ports
echo "Ensuring ports 5000 and 5173 are free..."
lsof -i:5000 -t | xargs kill -9 2>/dev/null
lsof -i:5173 -t | xargs kill -9 2>/dev/null

# Start the FastAPI backend
echo "Starting FastAPI backend on port 5000..."
cd backend
python3 -m uvicorn api.app:app --host 0.0.0.0 --port 5000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start the React frontend (using Vite)
echo "Starting React frontend on port 5173..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Application started!"
echo "Backend API: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "API Documentation: http://localhost:5000/docs"
echo "Press Ctrl+C to shutdown both servers"

# Wait for both processes to finish
wait $BACKEND_PID $FRONTEND_PID