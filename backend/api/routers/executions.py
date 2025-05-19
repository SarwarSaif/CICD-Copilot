from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import asyncio
import random
from ..database import get_db
from ..models import PipelineExecution, Pipeline
from ..schemas import PipelineExecution as PipelineExecutionSchema, PipelineExecutionCreate

router = APIRouter()

@router.get("/pipelines/{pipeline_id}/executions", response_model=List[PipelineExecutionSchema])
def get_pipeline_executions(pipeline_id: int, db: Session = Depends(get_db)):
    # Check if pipeline exists
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Get pipeline executions
    executions = db.query(PipelineExecution).filter(
        PipelineExecution.pipeline_id == pipeline_id
    ).order_by(PipelineExecution.started_at.desc()).all()
    
    return executions

@router.get("/pipelines/{pipeline_id}/executions/recent", response_model=List[PipelineExecutionSchema])
def get_recent_pipeline_executions(pipeline_id: int, limit: int = 5, db: Session = Depends(get_db)):
    # Check if pipeline exists
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Get recent pipeline executions
    executions = db.query(PipelineExecution).filter(
        PipelineExecution.pipeline_id == pipeline_id
    ).order_by(PipelineExecution.started_at.desc()).limit(limit).all()
    
    return executions

@router.get("/pipeline-executions/{execution_id}", response_model=PipelineExecutionSchema)
def get_pipeline_execution(execution_id: int, db: Session = Depends(get_db)):
    # Get pipeline execution
    execution = db.query(PipelineExecution).filter(PipelineExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Pipeline execution not found")
    
    return execution

@router.post("/pipeline-executions", response_model=PipelineExecutionSchema)
async def create_pipeline_execution(execution: PipelineExecutionCreate, db: Session = Depends(get_db)):
    # Check if pipeline exists
    pipeline = db.query(Pipeline).filter(Pipeline.id == execution.pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Create execution
    db_execution = PipelineExecution(
        status="running",
        logs="",
        results={},
        pipeline_id=execution.pipeline_id
    )
    
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    
    # Simulate execution in background (async)
    execution_id = db_execution.id
    
    # Use asyncio to simulate async execution
    async def simulate_execution():
        await asyncio.sleep(random.randint(2, 5))  # Simulate processing time
        
        # Update execution status
        success = random.random() > 0.3  # 70% chance of success
        
        async with db:
            execution = db.query(PipelineExecution).filter(PipelineExecution.id == execution_id).first()
            if not execution:
                return
            
            execution.status = "completed" if success else "failed"
            execution.completed_at = datetime.utcnow()
            execution.logs = "Pipeline executed successfully" if success else "Pipeline execution failed: Error in step 2"
            execution.results = {
                "success": success,
                "metrics": {"duration": random.randint(500, 2500)} if success else {},
                "error": "Step 2 failed with code 1" if not success else None
            }
            
            db.commit()
    
    # Start async execution (don't await, let it run in background)
    asyncio.create_task(simulate_execution())
    
    return db_execution

@router.put("/pipeline-executions/{execution_id}", response_model=PipelineExecutionSchema)
def update_pipeline_execution(execution_id: int, update_data: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    # Get execution
    execution = db.query(PipelineExecution).filter(PipelineExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Pipeline execution not found")
    
    # Update fields
    for key, value in update_data.items():
        if hasattr(execution, key):
            setattr(execution, key, value)
    
    db.commit()
    db.refresh(execution)
    
    return execution