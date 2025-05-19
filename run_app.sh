#!/bin/bash

# Start FastAPI server in the background
echo "🚀 Starting FastAPI backend on port 5001..."
python start_fastapi.py &
FASTAPI_PID=$!

# Wait for FastAPI to initialize
sleep 2

# Start the frontend in development mode
echo "🚀 Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

# Function to handle SIGINT (Ctrl+C)
function cleanup {
  echo "Shutting down services..."
  kill $FASTAPI_PID
  kill $FRONTEND_PID
  exit 0
}

# Register the cleanup function to run on SIGINT
trap cleanup SIGINT

echo "✅ Application is running!"
echo "   - FastAPI backend: http://localhost:5001"
echo "   - API documentation: http://localhost:5001/docs"
echo "   - React frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep the script running
wait $FASTAPI_PID $FRONTEND_PID