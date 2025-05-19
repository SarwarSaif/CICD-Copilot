from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import Pipeline, PipelineStep, MopFile
from ..schemas import Pipeline as PipelineSchema, PipelineCreate

router = APIRouter()

@router.get("/pipelines", response_model=List[Dict[str, Any]])
def get_all_pipelines(db: Session = Depends(get_db)):
    pipelines = db.query(Pipeline).all()
    
    # Get step count and mop file name for each pipeline
    result = []
    for pipeline in pipelines:
        step_count = db.query(PipelineStep).filter(PipelineStep.pipeline_id == pipeline.id).count()
        mop_file = db.query(MopFile).filter(MopFile.id == pipeline.mop_file_id).first()
        
        # Convert to dict to add additional fields
        pipeline_dict = {
            "id": pipeline.id,
            "name": pipeline.name,
            "description": pipeline.description,
            "status": pipeline.status,
            "userId": pipeline.user_id,
            "mopFileId": pipeline.mop_file_id,
            "createdAt": pipeline.created_at,
            "updatedAt": pipeline.updated_at,
            "stepCount": step_count,
            "mopFileName": mop_file.name if mop_file else "Unknown",
            "sharedWith": 0  # Mock data for development
        }
        result.append(pipeline_dict)
    
    return result

@router.get("/pipelines/{pipeline_id}", response_model=PipelineSchema)
def get_pipeline(pipeline_id: int, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.post("/pipelines", response_model=PipelineSchema)
def create_pipeline(pipeline: PipelineCreate, db: Session = Depends(get_db)):
    # Check if MOP file exists
    mop_file = db.query(MopFile).filter(MopFile.id == pipeline.mop_file_id).first()
    if not mop_file:
        raise HTTPException(status_code=404, detail="MOP file not found")
    
    # Create pipeline
    db_pipeline = Pipeline(
        name=pipeline.name,
        description=pipeline.description,
        status=pipeline.status,
        config=pipeline.config,
        user_id=pipeline.user_id,
        mop_file_id=pipeline.mop_file_id
    )
    
    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)
    
    return db_pipeline

@router.post("/pipelines/convert", response_model=PipelineSchema)
def convert_mop_to_pipeline(data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    # Extract data from request body
    mop_file_id = data.get("mopFileId")
    name = data.get("name", "New Pipeline")
    
    # Check if MOP file exists
    mop_file = db.query(MopFile).filter(MopFile.id == mop_file_id).first()
    if not mop_file:
        raise HTTPException(status_code=404, detail="MOP file not found")
    
    # Create pipeline
    pipeline = Pipeline(
        name=name,
        description=f"Converted from {mop_file.name}",
        status="draft",
        user_id=1,  # Mock user ID for development
        mop_file_id=mop_file_id,
        config={}
    )
    
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)
    
    return pipeline