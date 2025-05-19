import uvicorn
import asyncio
from sqlalchemy import inspect
from api.database import engine, Base
from api.models import User, MopFile, Pipeline, PipelineStep, PipelineExecution, SharedPipeline, TeamMember, IntegrationSettings

# Create the database tables
def create_tables():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # Create tables if they don't exist
    if not all(table in existing_tables for table in ['users', 'mop_files', 'pipelines', 'pipeline_steps', 'pipeline_executions', 'shared_pipelines', 'team_members', 'integration_settings']):
        Base.metadata.create_all(bind=engine)

# Initialize sample data for development
def initialize_sample_data():
    from sqlalchemy.orm import Session
    from api.database import SessionLocal
    import json
    from datetime import datetime
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if we already have sample data
        user_exists = db.query(User).filter(User.id == 1).first() is not None
        if user_exists:
            return
        
        # Create default user
        default_user = User(
            id=1,
            username="johndoe",
            password="password",
            email="john@devplatform.co",
            first_name="John",
            last_name="Doe"
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        
        # Create sample MOP files
        mop_file1 = MopFile(
            id=1,
            name="Data Cleaning Process",
            description="Standard data cleaning operations",
            content="# Data Cleaning Process\n\n## Pre-processing\n1. Remove duplicates\n2. Handle missing values\n\n## Transformation\n1. Normalize data\n2. Handle outliers\n\n## Validation\n1. Verify data format\n2. Ensure data integrity",
            user_id=1
        )
        
        mop_file2 = MopFile(
            id=2,
            name="ETL Workflow",
            description="Extract, Transform, Load pipeline",
            content="# ETL Workflow\n\n## Extract\n1. Connect to source database\n2. Query required data\n\n## Transform\n1. Clean data\n2. Apply business rules\n\n## Load\n1. Connect to target database\n2. Insert transformed data",
            user_id=1
        )
        
        mop_file3 = MopFile(
            id=3,
            name="QA Verification",
            description="Quality assurance verification steps",
            content="# QA Verification Process\n\n## Unit Testing\n1. Test individual components\n2. Verify edge cases\n\n## Integration Testing\n1. Test component interactions\n2. Verify end-to-end flow\n\n## Validation\n1. Verify against requirements\n2. Document test results",
            user_id=1
        )
        
        db.add_all([mop_file1, mop_file2, mop_file3])
        db.commit()
        
        # Create sample pipelines
        pipeline1 = Pipeline(
            id=1,
            name="Data Preprocessing Pipeline",
            description="Pipeline for data preprocessing tasks",
            status="active",
            config={"threadCount": 4, "logLevel": "info"},
            user_id=1,
            mop_file_id=1
        )
        
        pipeline2 = Pipeline(
            id=2,
            name="Data Integration Process",
            description="Pipeline for integrating various data sources",
            status="draft",
            config={"parallelJobs": 2, "timeout": 3600},
            user_id=1,
            mop_file_id=2
        )
        
        pipeline3 = Pipeline(
            id=3,
            name="Test Automation",
            description="Pipeline for automated testing",
            status="active",
            config={"environment": "staging", "notifyEmail": "team@example.com"},
            user_id=1,
            mop_file_id=3
        )
        
        db.add_all([pipeline1, pipeline2, pipeline3])
        db.commit()
        
        # Create sample pipeline steps
        steps = [
            PipelineStep(id=1, name="Data Collection", type="input", position=1, config={"source": "database"}, pipeline_id=1),
            PipelineStep(id=2, name="Data Cleaning", type="transform", position=2, config={"method": "outlier_removal"}, pipeline_id=1),
            PipelineStep(id=3, name="Data Validation", type="validation", position=3, config={"rules": ["format", "range"]}, pipeline_id=1),
            PipelineStep(id=4, name="Extract from Source", type="extract", position=1, config={"db": "postgres"}, pipeline_id=2),
            PipelineStep(id=5, name="Apply Transformations", type="transform", position=2, config={"transforms": ["normalize", "convert"]}, pipeline_id=2),
            PipelineStep(id=6, name="Load Target", type="load", position=3, config={"destination": "data_warehouse"}, pipeline_id=2),
            PipelineStep(id=7, name="Unit Tests", type="test", position=1, config={"testSuite": "unit"}, pipeline_id=3),
            PipelineStep(id=8, name="Integration Tests", type="test", position=2, config={"testSuite": "integration"}, pipeline_id=3),
            PipelineStep(id=9, name="Report Generation", type="output", position=3, config={"format": "pdf"}, pipeline_id=3)
        ]
        
        db.add_all(steps)
        db.commit()
        
        # Create sample pipeline executions
        executions = [
            PipelineExecution(id=1, status="completed", logs="Pipeline executed successfully", results={"success": True, "processedRecords": 1250}, pipeline_id=1, started_at=datetime(2023, 5, 15, 10, 0), completed_at=datetime(2023, 5, 15, 10, 5)),
            PipelineExecution(id=2, status="failed", logs="Error in step 2: Invalid data format", results={"success": False, "error": "Data format validation failed"}, pipeline_id=1, started_at=datetime(2023, 5, 16, 14, 30), completed_at=datetime(2023, 5, 16, 14, 32)),
            PipelineExecution(id=3, status="completed", logs="Pipeline executed successfully", results={"success": True, "processedRecords": 850}, pipeline_id=1, started_at=datetime(2023, 5, 17, 9, 0), completed_at=datetime(2023, 5, 17, 9, 6)),
            PipelineExecution(id=4, status="completed", logs="Pipeline executed successfully", results={"success": True, "processedRecords": 1500}, pipeline_id=3, started_at=datetime(2023, 5, 15, 11, 0), completed_at=datetime(2023, 5, 15, 11, 10)),
            PipelineExecution(id=5, status="running", logs="Executing step 2...", results={"progress": 60}, pipeline_id=3, started_at=datetime(2023, 5, 18, 10, 0), completed_at=None)
        ]
        
        db.add_all(executions)
        db.commit()
        
        # Create sample shared pipelines
        shared_pipelines = [
            SharedPipeline(id=1, pipeline_id=1, shared_by_user_id=1, shared_with_user_id=1, permissions="view", shared_at=datetime(2023, 5, 10)),
            SharedPipeline(id=2, pipeline_id=2, shared_by_user_id=1, shared_with_user_id=1, permissions="edit", shared_at=datetime(2023, 5, 12)),
            SharedPipeline(id=3, pipeline_id=3, shared_by_user_id=1, shared_with_user_id=1, permissions="admin", shared_at=datetime(2023, 5, 14))
        ]
        
        db.add_all(shared_pipelines)
        db.commit()
        
        # Create sample team members
        team_members = [
            TeamMember(id=1, name="Alice Smith", email="alice@example.com", role="developer", user_id=1),
            TeamMember(id=2, name="Bob Johnson", email="bob@example.com", role="manager", user_id=1),
            TeamMember(id=3, name="Carol Williams", email="carol@example.com", role="devops", user_id=1),
            TeamMember(id=4, name="Dave Brown", email="dave@example.com", role="analyst", user_id=1)
        ]
        
        db.add_all(team_members)
        db.commit()
        
        # Create sample integration settings
        integration_settings = IntegrationSettings(
            id=1,
            user_id=1,
            jenkins_url="https://jenkins.example.com",
            jenkins_username="jenkins_user",
            jenkins_token="jenkins_api_token",
            jenkins_job_template="<xml>Jenkins job template</xml>",
            github_url="https://github.com",
            github_username="github_user",
            github_token="github_token",
            github_repository="user/repo",
            github_branch="main"
        )
        
        db.add(integration_settings)
        db.commit()
        
    except Exception as e:
        print(f"Error initializing sample data: {e}")
        db.rollback()
    finally:
        db.close()

# Main function to run the application
async def main():
    # Create database tables
    create_tables()
    
    # Initialize sample data
    initialize_sample_data()
    
    # Start the FastAPI application
    config = uvicorn.Config(
        "api.app:app",
        host="0.0.0.0",
        port=5000,
        reload=True
    )
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    # Run the main function
    asyncio.run(main())