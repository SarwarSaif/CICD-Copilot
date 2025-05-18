# MOP to Pipeline Converter Platform

A developer platform for converting Manual Operation Procedure (MOP) files into executable pipelines with visualization.

## Overview

This platform allows developers to:

1. Upload and manage Manual Operation Procedure (MOP) files
2. Automatically convert MOP files into executable pipelines using LangChain
3. Visualize, execute, and monitor pipelines
4. Share pipelines with team members
5. Collect execution metrics and analytics

## Architecture

The platform consists of two main components:

1. **Frontend**: React-based web interface for interacting with the platform
2. **Backend**: Available in two implementations:
   - Express.js with in-memory storage (default)
   - Django with LangChain and PostgreSQL database (for production)

## Features

- Upload and manage MOP files (supports TXT, Word documents, and PDF files)
- Convert MOP files to executable pipelines with LangChain
- Generate Jenkins pipeline code from MOP files
- Interactive pipeline visualization with drag-and-drop editing
- Code editor with syntax highlighting for viewing and modifying Jenkins pipeline code
- Execute pipelines and track results
- Share pipelines with team members
- User authentication and authorization
- Performance metrics and analytics dashboard

## Local Development

### Prerequisites

- Node.js v18+ and npm
- Python 3.11+
- PostgreSQL database
- OpenAI API key (for LangChain)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mop-pipeline-converter.git
cd mop-pipeline-converter
```

2. Install frontend dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the project root with the following variables:

```
# For Express.js backend
PORT=5000

# For Django backend
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DJANGO_HOST=0.0.0.0
DJANGO_PORT=8000

# OpenAI API key for LangChain
OPENAI_API_KEY=your_openai_api_key
```

4. Start the application:

For Express.js backend (default):
```bash
npm run dev
```

For Django backend:
```bash
cd backend
python run_server.py
```

And in a separate terminal, start the frontend:
```bash
cd client
npm run dev
```

5. Access the application:

Frontend: http://localhost:5173
Express.js API: http://localhost:5000/api
Django API: http://localhost:8000/api

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or similar)
- kubectl configured to connect to your cluster
- Helm v3+
- Container registry access

### Deployment Steps

1. Build and push Docker images:

```bash
# Build and push frontend image
docker build -t your-registry/mop-pipeline-frontend:latest -f Dockerfile.frontend .
docker push your-registry/mop-pipeline-frontend:latest

# Build and push backend image
docker build -t your-registry/mop-pipeline-backend:latest -f Dockerfile.backend .
docker push your-registry/mop-pipeline-backend:latest
```

2. Create Kubernetes namespace:

```bash
kubectl create namespace mop-pipeline
```

3. Deploy PostgreSQL database (using Helm):

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --namespace mop-pipeline \
  --set auth.username=admin \
  --set auth.password=adminpassword \
  --set auth.database=moppipeline
```

4. Create Kubernetes secrets:

```bash
kubectl create secret generic mop-pipeline-secrets \
  --namespace mop-pipeline \
  --from-literal=DJANGO_SECRET_KEY=your_secret_key \
  --from-literal=OPENAI_API_KEY=your_openai_api_key \
  --from-literal=POSTGRES_PASSWORD=adminpassword
```

5. Deploy the application:

```bash
kubectl apply -f kubernetes/deployment.yaml -n mop-pipeline
kubectl apply -f kubernetes/service.yaml -n mop-pipeline
kubectl apply -f kubernetes/ingress.yaml -n mop-pipeline
```

6. Access the application:

The platform will be available at the URL configured in your ingress.

## Using the Platform

1. **MOP Files**: Upload your MOP files using the MOP Files page. The platform supports:
   - Text (.txt) files
   - Word documents (.doc, .docx)
   - PDF (.pdf) files

2. **Pipelines**: Create pipelines from MOP files using the interactive visual editor:
   - Drag and drop components onto the canvas
   - Connect nodes to create a workflow
   - Configure node properties in the right panel
   - Save your pipeline design

3. **Jenkins Pipeline Code**: Work with Jenkins pipeline code directly:
   - View the generated Jenkins pipeline code in the "Jenkins Pipeline" tab
   - Edit the code with syntax highlighting in the built-in code editor
   - Save your changes to update the pipeline configuration

4. **Execution**: Execute pipelines and monitor their status.

5. **Sharing**: Share pipelines with team members with view or edit permissions.

6. **Dashboard**: Monitor overall platform usage and performance metrics.

## API Documentation

The platform provides REST API endpoints for programmatic access:

- Express.js API: http://localhost:5000/api
- Django API: http://localhost:8000/api

Detailed API documentation is available in the backend README.

## Technology Stack

### Frontend
- React
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling
- ReactFlow for interactive pipeline visualization 
- React Hook Form for form management
- Zod for validation

### Backend (Express.js)
- Node.js with Express
- TypeScript
- Drizzle ORM with PostgreSQL
- In-memory storage with interfaces

### Backend (Django)
- Django REST Framework
- LangChain for MOP processing
- OpenAI integration for processing MOP files
- PostgreSQL database

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.