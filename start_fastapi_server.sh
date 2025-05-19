#!/bin/bash

# Start FastAPI server
echo "Starting FastAPI server..."
python start_fastapi.py &
FASTAPI_PID=$!

# Wait for FastAPI to be ready
echo "Waiting for FastAPI server to be ready..."
sleep 5

# Print status
echo "FastAPI server running with PID: $FASTAPI_PID"
echo "Access the API at: http://localhost:5000/api"
echo "Access the documentation at: http://localhost:5000/docs"

# Keep script running
wait $FASTAPI_PID