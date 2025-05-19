from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# MOP File schemas
class MopFileBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    user_id: int

class MopFileCreate(MopFileBase):
    pass

class MopFile(MopFileBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Pipeline schemas
class PipelineBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "draft"
    user_id: int
    mop_file_id: int
    config: Optional[Dict[str, Any]] = None

class PipelineCreate(PipelineBase):
    pass

class Pipeline(PipelineBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Pipeline Step schemas
class PipelineStepBase(BaseModel):
    name: str
    type: str
    position: int
    pipeline_id: int
    config: Optional[Dict[str, Any]] = None

class PipelineStepCreate(PipelineStepBase):
    pass

class PipelineStep(PipelineStepBase):
    id: int

    class Config:
        orm_mode = True

# Pipeline Execution schemas
class PipelineExecutionBase(BaseModel):
    status: str = "pending"
    pipeline_id: int
    logs: Optional[str] = None
    results: Optional[Dict[str, Any]] = None

class PipelineExecutionCreate(PipelineExecutionBase):
    pass

class PipelineExecution(PipelineExecutionBase):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Shared Pipeline schemas
class SharedPipelineBase(BaseModel):
    pipeline_id: int
    shared_by_user_id: int
    shared_with_user_id: int
    permissions: str = "view"

class SharedPipelineCreate(SharedPipelineBase):
    pass

class SharedPipeline(SharedPipelineBase):
    id: int
    shared_at: datetime

    class Config:
        orm_mode = True

# Team Member schemas
class TeamMemberBase(BaseModel):
    name: str
    email: str
    role: str = "member"
    user_id: int

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMember(TeamMemberBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Integration Settings schemas
class IntegrationSettingsBase(BaseModel):
    user_id: int
    jenkins_url: Optional[str] = None
    jenkins_username: Optional[str] = None
    jenkins_token: Optional[str] = None
    jenkins_job_template: Optional[str] = None
    github_url: Optional[str] = None
    github_username: Optional[str] = None
    github_token: Optional[str] = None
    github_repository: Optional[str] = None
    github_branch: str = "main"

class IntegrationSettingsCreate(IntegrationSettingsBase):
    pass

class IntegrationSettingsUpdate(BaseModel):
    jenkins_url: Optional[str] = None
    jenkins_username: Optional[str] = None
    jenkins_token: Optional[str] = None
    jenkins_job_template: Optional[str] = None
    github_url: Optional[str] = None
    github_username: Optional[str] = None
    github_token: Optional[str] = None
    github_repository: Optional[str] = None
    github_branch: Optional[str] = None

class IntegrationSettings(IntegrationSettingsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True