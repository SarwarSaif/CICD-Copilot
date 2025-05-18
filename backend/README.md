# MOP to Pipeline Converter Backend

This backend is built with Django + LangChain to convert Manual Operation Procedure (MOP) files into executable pipelines.

## Overview

The MOP to Pipeline converter backend provides a set of REST API endpoints that allow users to:

1. Upload and manage MOP files
2. Convert MOP files to executable pipelines using LangChain
3. Execute and monitor pipeline runs
4. Share pipelines with team members

## Architecture

The backend consists of the following components:

- **Django REST Framework**: Provides the REST API endpoints
- **LangChain**: Processes MOP files and converts them to pipeline configurations
- **PostgreSQL**: Stores MOP files, pipelines, executions, and user data

## API Endpoints

The backend provides the following API endpoints:

- `/api/mop-files/`: MOP file management
- `/api/mop-files/<id>/convert_to_pipeline/`: Convert MOP to pipeline
- `/api/pipelines/`: Pipeline management
- `/api/pipelines/<id>/execute/`: Execute a pipeline
- `/api/pipeline-steps/`: Pipeline step management
- `/api/pipeline-executions/`: Pipeline execution tracking
- `/api/shared-pipelines/`: Pipeline sharing
- `/api/team-members/`: Team member management
- `/api/stats/`: System statistics

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL database
- OpenAI API key (for LangChain)

### Installation

1. Create a `.env` file in the project root with the following variables:

```
# Django settings
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database settings (Already provided via DATABASE_URL)

# OpenAI API key for LangChain
OPENAI_API_KEY=your_openai_api_key
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
cd backend
python run_server.py
```

The server will initialize the database, create a superuser if needed, and start the Django development server.

## Integration with Frontend

The frontend can communicate with the backend via the REST API endpoints. All endpoints return JSON responses.

Example request to convert a MOP file to a pipeline:

```javascript
// Frontend code (using fetch)
const response = await fetch('/api/mop-files/1/convert_to_pipeline/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  }
});

const pipeline = await response.json();
```

## Database Models

The backend uses the following database models:

- **MopFile**: Represents a Manual Operation Procedure file
- **Pipeline**: Represents an executable pipeline created from a MOP file
- **PipelineStep**: Represents a step in a pipeline
- **PipelineExecution**: Tracks pipeline executions
- **SharedPipeline**: Manages sharing of pipelines between users
- **TeamMember**: Represents a team member

## Authentication

The backend uses Django's authentication system. API endpoints require authentication by default.

## Deployment

For production deployment, consider the following steps:

1. Set `DEBUG=False` in the `.env` file
2. Configure a proper `DJANGO_SECRET_KEY`
3. Set appropriate `ALLOWED_HOSTS`
4. Use a production-ready web server (e.g., Gunicorn, uWSGI)
5. Set up HTTPS

## Local Development 

To run the backend locally:

```bash
cd backend
python run_server.py
```

This will start the Django server on port 8000 by default.