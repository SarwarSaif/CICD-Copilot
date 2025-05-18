#!/bin/bash
# Build React frontend to be served by Django

echo "Building React frontend..."
npm run build

# Create directory in Django static folder
mkdir -p backend/staticfiles/assets

# Copy build files to Django static directory
cp -r dist/* backend/staticfiles/

echo "React build complete. Files copied to Django static directory."