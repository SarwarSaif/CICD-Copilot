from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import SharedPipeline, Pipeline, User
from ..schemas import SharedPipeline as SharedPipelineSchema, SharedPipelineCreate

router = APIRouter()

@router.get("/pipelines/shared", response_model=List[Dict[str, Any]])
def get_shared_pipelines(db: Session = Depends(get_db)):
    # Get all shared pipelines with extended info
    shared_pipelines = db.query(SharedPipeline).all()
    
    result = []
    for shared in shared_pipelines:
        pipeline = db.query(Pipeline).filter(Pipeline.id == shared.pipeline_id).first()
        shared_by = db.query(User).filter(User.id == shared.shared_by_user_id).first()
        shared_with = db.query(User).filter(User.id == shared.shared_with_user_id).first()
        
        if pipeline and shared_by and shared_with:
            shared_dict = {
                "id": shared.id,
                "pipelineId": shared.pipeline_id,
                "sharedByUserId": shared.shared_by_user_id,
                "sharedWithUserId": shared.shared_with_user_id,
                "permissions": shared.permissions,
                "sharedAt": shared.shared_at,
                "pipelineName": pipeline.name,
                "sharedBy": f"{shared_by.first_name} {shared_by.last_name}",
                "sharedWith": f"{shared_with.first_name} {shared_with.last_name}"
            }
            result.append(shared_dict)
    
    return result

@router.post("/pipelines/share", response_model=SharedPipelineSchema)
def share_pipeline(shared_pipeline: SharedPipelineCreate, db: Session = Depends(get_db)):
    # Check if pipeline exists
    pipeline = db.query(Pipeline).filter(Pipeline.id == shared_pipeline.pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Check if users exist
    shared_by = db.query(User).filter(User.id == shared_pipeline.shared_by_user_id).first()
    if not shared_by:
        raise HTTPException(status_code=404, detail="Shared by user not found")
    
    shared_with = db.query(User).filter(User.id == shared_pipeline.shared_with_user_id).first()
    if not shared_with:
        raise HTTPException(status_code=404, detail="Shared with user not found")
    
    # Create shared pipeline
    db_shared_pipeline = SharedPipeline(
        pipeline_id=shared_pipeline.pipeline_id,
        shared_by_user_id=shared_pipeline.shared_by_user_id,
        shared_with_user_id=shared_pipeline.shared_with_user_id,
        permissions=shared_pipeline.permissions
    )
    
    db.add(db_shared_pipeline)
    db.commit()
    db.refresh(db_shared_pipeline)
    
    return db_shared_pipeline