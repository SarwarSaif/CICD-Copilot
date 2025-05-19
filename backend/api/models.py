from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    mop_files = relationship("MopFile", back_populates="user")
    pipelines = relationship("Pipeline", back_populates="user")
    integration_settings = relationship("IntegrationSettings", back_populates="user")
    
    def __str__(self):
        return self.username

class MopFile(Base):
    __tablename__ = "mop_files"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="mop_files")
    pipelines = relationship("Pipeline", back_populates="mop_file")
    
    def __str__(self):
        return self.name

class Pipeline(Base):
    __tablename__ = "pipelines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    status = Column(String, default="draft")
    config = Column(JSON, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mop_file_id = Column(Integer, ForeignKey("mop_files.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="pipelines")
    mop_file = relationship("MopFile", back_populates="pipelines")
    steps = relationship("PipelineStep", back_populates="pipeline", cascade="all, delete-orphan")
    executions = relationship("PipelineExecution", back_populates="pipeline", cascade="all, delete-orphan")
    shared_pipelines = relationship("SharedPipeline", back_populates="pipeline", cascade="all, delete-orphan")
    
    def __str__(self):
        return self.name

class PipelineStep(Base):
    __tablename__ = "pipeline_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    config = Column(JSON, nullable=True)
    position = Column(Integer)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"))
    
    # Relationships
    pipeline = relationship("Pipeline", back_populates="steps")
    
    def __str__(self):
        return self.name

class PipelineExecution(Base):
    __tablename__ = "pipeline_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="pending")
    logs = Column(Text, nullable=True)
    results = Column(JSON, nullable=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"))
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    pipeline = relationship("Pipeline", back_populates="executions")
    
    def __str__(self):
        return f"Execution {self.id} ({self.status})"

class SharedPipeline(Base):
    __tablename__ = "shared_pipelines"
    
    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"))
    shared_by_user_id = Column(Integer, ForeignKey("users.id"))
    shared_with_user_id = Column(Integer, ForeignKey("users.id"))
    permissions = Column(String, default="view")
    shared_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    pipeline = relationship("Pipeline", back_populates="shared_pipelines")
    shared_by = relationship("User", foreign_keys=[shared_by_user_id])
    shared_with = relationship("User", foreign_keys=[shared_with_user_id])
    
    def __str__(self):
        return f"Shared pipeline {self.pipeline_id}"

class TeamMember(Base):
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    role = Column(String, default="member")
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    def __str__(self):
        return self.name

class IntegrationSettings(Base):
    __tablename__ = "integration_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    jenkins_url = Column(String, nullable=True)
    jenkins_username = Column(String, nullable=True)
    jenkins_token = Column(String, nullable=True)
    jenkins_job_template = Column(Text, nullable=True)
    github_url = Column(String, nullable=True)
    github_username = Column(String, nullable=True)
    github_token = Column(String, nullable=True)
    github_repository = Column(String, nullable=True)
    github_branch = Column(String, default="main")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="integration_settings")
    
    def __str__(self):
        return f"Integration Settings for {self.user_id}"