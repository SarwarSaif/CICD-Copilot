from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
import os

from .database import get_db
from .models import Base
from .routers import mop_files, pipelines, pipeline_steps, executions, shared, team, settings, jenkins

# Create FastAPI app
app = FastAPI(title="MOP to Pipeline Converter API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(mop_files.router, prefix="/api", tags=["MOP Files"])
app.include_router(pipelines.router, prefix="/api", tags=["Pipelines"])
app.include_router(pipeline_steps.router, prefix="/api", tags=["Pipeline Steps"])
app.include_router(executions.router, prefix="/api", tags=["Pipeline Executions"])
app.include_router(shared.router, prefix="/api", tags=["Shared Pipelines"])
app.include_router(team.router, prefix="/api", tags=["Team Members"])
app.include_router(settings.router, prefix="/api", tags=["Integration Settings"])
app.include_router(jenkins.router, prefix="/api", tags=["Jenkins Pipeline"])

# Mock auth endpoint for development
@app.get("/api/auth/me")
def get_current_user():
    # Mock current user for development
    return {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@devplatform.co",
        "username": "johndoe",
    }

# Dashboard stats endpoint
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    from .models import MopFile, Pipeline, SharedPipeline
    
    total_mop_files = db.query(MopFile).count()
    pipelines = db.query(Pipeline).count()
    shared = db.query(SharedPipeline).count()
    
    return {
        "totalMopFiles": total_mop_files,
        "pipelines": pipelines,
        "shared": shared
    }

# Mount static files for frontend in production
@app.on_event("startup")
async def startup():
    # In production, serve the built React app
    if os.environ.get("ENV") == "production":
        app.mount("/", StaticFiles(directory="../client/dist", html=True), name="static")