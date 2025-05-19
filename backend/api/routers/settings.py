from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from ..database import get_db
from ..models import IntegrationSettings, User
from ..schemas import IntegrationSettings as IntegrationSettingsSchema, IntegrationSettingsCreate, IntegrationSettingsUpdate

router = APIRouter()

@router.get("/integration-settings/{user_id}", response_model=Dict[str, Any])
def get_integration_settings(user_id: int, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get integration settings for user
    settings = db.query(IntegrationSettings).filter(IntegrationSettings.user_id == user_id).first()
    
    # If no settings found, return empty settings
    if not settings:
        return {
            "userId": user_id,
            "jenkinsUrl": "",
            "jenkinsUsername": "",
            "jenkinsToken": "",
            "jenkinsJobTemplate": "",
            "githubUrl": "",
            "githubUsername": "",
            "githubToken": "",
            "githubRepository": "",
            "githubBranch": "main"
        }
    
    return {
        "id": settings.id,
        "userId": settings.user_id,
        "jenkinsUrl": settings.jenkins_url or "",
        "jenkinsUsername": settings.jenkins_username or "",
        "jenkinsToken": settings.jenkins_token or "",
        "jenkinsJobTemplate": settings.jenkins_job_template or "",
        "githubUrl": settings.github_url or "",
        "githubUsername": settings.github_username or "",
        "githubToken": settings.github_token or "",
        "githubRepository": settings.github_repository or "",
        "githubBranch": settings.github_branch or "main",
        "createdAt": settings.created_at,
        "updatedAt": settings.updated_at
    }

@router.post("/integration-settings/{user_id}", response_model=IntegrationSettingsSchema)
def update_integration_settings(user_id: int, settings_data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if settings exist for user
    settings = db.query(IntegrationSettings).filter(IntegrationSettings.user_id == user_id).first()
    
    if settings:
        # Update existing settings
        for key, value in settings_data.items():
            # Convert camelCase to snake_case for database fields
            db_key = ""
            for i, char in enumerate(key):
                if char.isupper():
                    db_key += "_" + char.lower()
                else:
                    db_key += char
            
            if hasattr(settings, db_key):
                setattr(settings, db_key, value)
        
        db.commit()
        db.refresh(settings)
    else:
        # Create new settings
        settings_data["user_id"] = user_id
        
        # Convert camelCase to snake_case for database fields
        db_data = {}
        for key, value in settings_data.items():
            db_key = ""
            for i, char in enumerate(key):
                if char.isupper():
                    db_key += "_" + char.lower()
                else:
                    db_key += char
            
            db_data[db_key] = value
        
        settings = IntegrationSettings(**db_data)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings