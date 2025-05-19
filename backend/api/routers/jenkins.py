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

router = APIRouter(prefix="/api/jenkins", tags=["jenkins"])


@router.get("/convert/{mop_file_id}", response_model=JenkinsPipelineResponse)
def convert_mop_to_jenkins(
    mop_file_id: int,
    db: Session = Depends(get_db)
):
    """
    Convert MOP file content to Jenkins pipeline format
    """
    # Get MOP file from database
    mop_file = db.query(MopFile).filter(MopFile.id == mop_file_id).first()
    if not mop_file:
        raise HTTPException(status_code=404, detail="MOP file not found")
    
    # Convert MOP file content to Jenkins pipeline
    jenkins_code = convert_to_jenkins_pipeline(mop_file.content)
    
    return {"jenkins_code": jenkins_code}


@router.get("/pipeline/{pipeline_id}", response_model=JenkinsPipelineResponse)
def get_pipeline_as_jenkins(
    pipeline_id: int,
    db: Session = Depends(get_db)
):
    """
    Get Jenkins pipeline code for an existing pipeline
    """
    # Get pipeline from database
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Get associated MOP file
    mop_file = db.query(MopFile).filter(MopFile.id == pipeline.mop_file_id).first()
    if not mop_file:
        raise HTTPException(status_code=404, detail="Associated MOP file not found")
    
    # Convert to Jenkins pipeline format
    pipeline_dict = {
        "id": pipeline.id,
        "name": pipeline.name,
        "config": pipeline.config
    }
    jenkins_code = convert_to_jenkins_pipeline(mop_file.content, pipeline_dict)
    
    return {"jenkins_code": jenkins_code}