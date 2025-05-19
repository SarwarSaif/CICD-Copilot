"""
Pydantic Schemas for FastAPI
"""
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field


# User schemas
class UserBase(BaseModel):
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# MOP File schemas
class MopFileBase(BaseModel):
    name: str
    description: Optional[str] = None
    file_type: str
    content: str


class MopFileCreate(MopFileBase):
    user_id: int


class MopFile(MopFileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Pipeline schemas
class PipelineBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "draft"
    config: Optional[Dict[str, Any]] = None


class PipelineCreate(PipelineBase):
    user_id: int
    mop_file_id: int


class Pipeline(PipelineBase):
    id: int
    user_id: int
    mop_file_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Pipeline Step schemas
class PipelineStepBase(BaseModel):
    name: str
    type: str
    position: int
    config: Optional[Dict[str, Any]] = None


class PipelineStepCreate(PipelineStepBase):
    pipeline_id: int


class PipelineStep(PipelineStepBase):
    id: int
    pipeline_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Pipeline Execution schemas
class PipelineExecutionBase(BaseModel):
    status: str = "pending"
    logs: Optional[str] = None
    results: Optional[Dict[str, Any]] = None


class PipelineExecutionCreate(PipelineExecutionBase):
    pipeline_id: int


class PipelineExecution(PipelineExecutionBase):
    id: int
    pipeline_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Shared Pipeline schemas
class SharedPipelineBase(BaseModel):
    shared_with: str
    permissions: str = "read"


class SharedPipelineCreate(SharedPipelineBase):
    pipeline_id: int
    shared_by: int


class SharedPipeline(SharedPipelineBase):
    id: int
    pipeline_id: int
    shared_by: int
    shared_at: datetime

    class Config:
        from_attributes = True


# Team Member schemas
class TeamMemberBase(BaseModel):
    name: str
    email: str
    role: str


class TeamMemberCreate(TeamMemberBase):
    user_id: int


class TeamMember(TeamMemberBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Integration Settings schemas
class IntegrationSettingsBase(BaseModel):
    jenkins_url: Optional[str] = None
    jenkins_username: Optional[str] = None
    jenkins_token: Optional[str] = None
    github_url: Optional[str] = None
    github_username: Optional[str] = None
    github_token: Optional[str] = None
    artifactory_url: Optional[str] = None
    artifactory_username: Optional[str] = None
    artifactory_token: Optional[str] = None


class IntegrationSettingsCreate(IntegrationSettingsBase):
    user_id: int


class IntegrationSettings(IntegrationSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Stats Response schema
class StatsResponse(BaseModel):
    total_mop_files: int
    pipelines: int
    shared: int


# Jenkins Pipeline Response schema
class JenkinsPipelineResponse(BaseModel):
    jenkins_code: str