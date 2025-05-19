#!/bin/bash

# Start both Express.js frontend and FastAPI backend servers

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
echo "Ensuring ports 5000 and 5001 are free..."
pkill -f "uvicorn api.app:app" 2>/dev/null

# Start the FastAPI backend in the background
echo "Starting FastAPI backend on port 5001..."
cd backend
python3 -m uvicorn api.app:app --host 0.0.0.0 --port 5001 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start the Express.js frontend (which serves the React app)
echo "Starting Express.js frontend on port 5000..."
NODE_ENV=development tsx server/index.ts &
FRONTEND_PID=$!

echo "Application started!"
echo "Frontend: http://localhost:5000"
echo "FastAPI Backend: http://localhost:5001"
echo "API Documentation: http://localhost:5001/docs"
echo "Press Ctrl+C to shutdown both servers"

# Wait for both processes to finish
wait $BACKEND_PID $FRONTEND_PID