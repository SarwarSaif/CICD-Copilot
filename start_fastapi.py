import subprocess
import sys
import os

def main():
    """Run the FastAPI server"""
    print("Starting FastAPI server...")
    
    # Check if running in a repl.it environment
    is_replit = os.environ.get('REPLIT_DB_URL') is not None
    
    # Run the FastAPI server
    try:
        process = subprocess.run(
            [sys.executable, "backend/main.py"],
            check=True
        )
        return process.returncode
    except subprocess.CalledProcessError as e:
        print(f"Error starting FastAPI server: {e}")
        return e.returncode
    except KeyboardInterrupt:
        print("Server stopped by user")
        return 0

if __name__ == "__main__":
    sys.exit(main())