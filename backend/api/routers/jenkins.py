"""
Jenkins Pipeline Router
API endpoints related to Jenkins pipeline conversion
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MopFile, Pipeline
from ..schemas import JenkinsPipelineResponse
from ..jenkins_converter import convert_to_jenkins_pipeline

router = APIRouter()

@router.get("/jenkins/convert/{mop_file_id}", response_model=JenkinsPipelineResponse)
def convert_mop_to_jenkins(
    mop_file_id: int,
    db: Session = Depends(get_db)
):
    """
    Convert a MOP file to Jenkins pipeline format
    """
    # Get the MOP file
    mop_file = db.query(MopFile).filter(MopFile.id == mop_file_id).first()
    if not mop_file:
        raise HTTPException(status_code=404, detail="MOP file not found")
    
    # Convert MOP content to Jenkins pipeline
    jenkins_code = convert_to_jenkins_pipeline(str(mop_file.content))
    
    return {"jenkins_code": jenkins_code}

@router.post("/jenkins/convert/pipeline/{pipeline_id}", response_model=JenkinsPipelineResponse)
def get_jenkins_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db)
):
    """
    Get Jenkins pipeline code from an existing pipeline configuration
    """
    # Get the pipeline
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Get associated MOP file
    mop_file = db.query(MopFile).filter(MopFile.id == pipeline.mop_file_id).first()
    if not mop_file:
        raise HTTPException(status_code=404, detail="MOP file not found")
    
    # Convert to Jenkins pipeline using both MOP content and pipeline config
    jenkins_code = convert_to_jenkins_pipeline(
        str(mop_file.content), 
        pipeline.config if pipeline.config else None
    )
    
    return {"jenkins_code": jenkins_code}