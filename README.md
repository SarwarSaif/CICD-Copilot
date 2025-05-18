# MOP to Pipeline Converter Platform

A developer platform for converting Manual Operation Procedure (MOP) files into executable pipelines with visualization.

## Features

- **MOP File Management**: Upload, view, and manage manual operation procedure files
- **Pipeline Creation**: Convert MOP files into executable pipelines
- **Pipeline Execution**: Run pipelines and track execution status
- **Collaboration**: Share pipelines with team members with customizable permissions
- **Visualization**: View pipeline steps and execution results

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Library**: Tailwind CSS with Shadcn UI components
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query
- **Routing**: Wouter

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- PostgreSQL (v14 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/mop-pipeline-converter.git
cd mop-pipeline-converter
```

2. Install dependencies:

```bash
npm install
```

3. Set up the environment variables by creating a `.env` file in the root directory:

```
DATABASE_URL=postgresql://username:password@localhost:5432/mop_pipelines
```

4. Push the database schema:

```bash
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

6. The application will be available at [http://localhost:5000](http://localhost:5000)

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│       ├── components/ # Reusable UI components
│       ├── hooks/      # Custom React hooks
│       ├── lib/        # Utility functions and client setup
│       ├── pages/      # Application pages
│       ├── App.tsx     # Main application component
│       └── main.tsx    # Entry point
├── server/             # Backend Express server
│   ├── db.ts           # Database connection and setup
│   ├── routes.ts       # API route definitions
│   ├── storage.ts      # Storage interface definition
│   ├── database-storage.ts # Database implementation of storage
│   ├── index.ts        # Server entry point
│   └── vite.ts         # Vite integration for SSR
├── shared/             # Shared code between client and server
│   └── schema.ts       # Database schema and type definitions
└── drizzle.config.ts   # Drizzle ORM configuration
```

## Database Schema

The platform uses the following database tables:

- `users`: User accounts with authentication information
- `mop_files`: Manual operation procedure files
- `pipelines`: Pipeline definitions created from MOP files
- `pipeline_steps`: Individual steps within a pipeline
- `pipeline_executions`: Execution records for pipelines
- `shared_pipelines`: Records of pipelines shared between users
- `team_members`: Team member information

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.22+)
- kubectl CLI configured to your cluster
- Docker image of the application

### Deployment Steps

1. Build and push the Docker image:

```bash
docker build -t mop-pipeline-converter:latest .
docker tag mop-pipeline-converter:latest your-registry/mop-pipeline-converter:latest
docker push your-registry/mop-pipeline-converter:latest
```

2. Create Kubernetes deployment files:

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mop-pipeline-converter
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mop-pipeline-converter
  template:
    metadata:
      labels:
        app: mop-pipeline-converter
    spec:
      containers:
      - name: mop-pipeline-converter
        image: your-registry/mop-pipeline-converter:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mop-pipeline-secrets
              key: database_url
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
```

**service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mop-pipeline-converter
spec:
  selector:
    app: mop-pipeline-converter
  ports:
  - port: 80
    targetPort: 5000
  type: ClusterIP
```

**ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mop-pipeline-converter
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - mop-pipeline.example.com
    secretName: mop-pipeline-tls
  rules:
  - host: mop-pipeline.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mop-pipeline-converter
            port:
              number: 80
```

**secrets.yaml**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mop-pipeline-secrets
type: Opaque
data:
  database_url: <base64-encoded-database-url>
```

3. Apply the Kubernetes configuration:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f secrets.yaml
```

4. Verify the deployment:

```bash
kubectl get pods -l app=mop-pipeline-converter
kubectl get svc mop-pipeline-converter
kubectl get ingress mop-pipeline-converter
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.