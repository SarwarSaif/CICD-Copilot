#!/bin/bash

# Start the FastAPI server on port 5001
echo "Starting FastAPI server on port 5001..."
cd backend
python3 -m uvicorn api.app:app --host 0.0.0.0 --port 5001 --reload