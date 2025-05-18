#!/usr/bin/env python
"""
Run script for the MOP to Pipeline converter Django backend.
This script will:
1. Create database migrations
2. Apply migrations to set up the database schema
3. Create a superuser (if none exists)
4. Start the Django development server
"""

import os
import sys
import subprocess
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mop_pipeline_project.settings')
django.setup()

from django.contrib.auth.models import User
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_command(command):
    """Run a shell command and print output"""
    process = subprocess.Popen(
        command, 
        shell=True, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT
    )
    
    for line in iter(process.stdout.readline, b''):
        print(line.decode('utf-8'), end='')
    
    process.stdout.close()
    return process.wait()

def setup_database():
    """Create and apply migrations"""
    print("Creating database migrations...")
    run_command('python3 manage.py makemigrations api')
    
    print("\nApplying migrations...")
    run_command('python3 manage.py migrate')

def create_superuser():
    """Create a superuser if one doesn't exist"""
    if not User.objects.filter(is_superuser=True).exists():
        print("\nCreating admin superuser...")
        username = os.environ.get('DJANGO_ADMIN_USERNAME', 'admin')
        email = os.environ.get('DJANGO_ADMIN_EMAIL', 'admin@example.com')
        password = os.environ.get('DJANGO_ADMIN_PASSWORD', 'adminpassword')
        
        User.objects.create_superuser(username, email, password)
        print(f"Superuser '{username}' created successfully")
    else:
        print("\nSuperuser already exists, skipping creation")

def run_server():
    """Start the Django development server"""
    host = os.environ.get('DJANGO_HOST', '0.0.0.0')
    port = os.environ.get('DJANGO_PORT', '8000')
    print(f"\nStarting Django server at {host}:{port}...")
    run_command(f'python3 manage.py runserver {host}:{port}')

if __name__ == '__main__':
    # Change to the backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    setup_database()
    create_superuser()
    run_server()