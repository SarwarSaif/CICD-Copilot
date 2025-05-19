from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import PipelineStep, Pipeline
from ..schemas import PipelineStep as PipelineStepSchema, PipelineStepCreate

router = APIRouter()

@router.get("/pipelines/{pipeline_id}/steps", response_model=List[PipelineStepSchema])
def get_pipeline_steps(pipeline_id: int, db: Session = Depends(get_db)):
    # Check if pipeline exists
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Get pipeline steps
    steps = db.query(PipelineStep).filter(PipelineStep.pipeline_id == pipeline_id).order_by(PipelineStep.position).all()
    return steps

@router.post("/pipeline-steps", response_model=PipelineStepSchema)
def create_pipeline_step(step: PipelineStepCreate, db: Session = Depends(get_db)):
    # Check if pipeline exists
    pipeline = db.query(Pipeline).filter(Pipeline.id == step.pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Create step
    db_step = PipelineStep(
        name=step.name,
        type=step.type,
        position=step.position,
        config=step.config,
        pipeline_id=step.pipeline_id
    )
    
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    
    return db_step

@router.put("/pipeline-steps/{step_id}", response_model=PipelineStepSchema)
def update_pipeline_step(step_id: int, step_data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    # Get step
    step = db.query(PipelineStep).filter(PipelineStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Pipeline step not found")
    
    # Update fields
    for key, value in step_data.items():
        if hasattr(step, key):
            setattr(step, key, value)
    
    db.commit()
    db.refresh(step)
    
    return step

@router.delete("/pipeline-steps/{step_id}", response_model=Dict[str, bool])
def delete_pipeline_step(step_id: int, db: Session = Depends(get_db)):
    # Get step
    step = db.query(PipelineStep).filter(PipelineStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Pipeline step not found")
    
    # Delete step
    db.delete(step)
    db.commit()
    
    return {"success": True}