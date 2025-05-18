import { 
  User, InsertUser, 
  MopFile, InsertMopFile,
  Pipeline, InsertPipeline,
  PipelineStep, InsertPipelineStep,
  PipelineExecution, InsertPipelineExecution,
  SharedPipeline, InsertSharedPipeline,
  TeamMember, InsertTeamMember
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // MOP file operations
  getAllMopFiles(): Promise<MopFile[]>;
  getRecentMopFiles(limit?: number): Promise<MopFile[]>;
  getMopFile(id: number): Promise<MopFile | undefined>;
  getMopFileCount(): Promise<number>;
  createMopFile(mopFile: InsertMopFile): Promise<MopFile>;
  
  // Pipeline operations
  getAllPipelines(): Promise<Pipeline[]>;
  getPipeline(id: number): Promise<Pipeline | undefined>;
  getPipelineCount(): Promise<number>;
  getPipelineStepCount(pipelineId: number): Promise<number>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  
  // Pipeline steps operations
  getPipelineSteps(pipelineId: number): Promise<PipelineStep[]>;
  createPipelineStep(step: InsertPipelineStep): Promise<PipelineStep>;
  updatePipelineStep(id: number, step: Partial<PipelineStep>): Promise<PipelineStep | undefined>;
  deletePipelineStep(id: number): Promise<boolean>;
  
  // Pipeline execution operations
  getAllPipelineExecutions(pipelineId: number): Promise<PipelineExecution[]>;
  getRecentPipelineExecutions(pipelineId: number, limit?: number): Promise<PipelineExecution[]>;
  getPipelineExecution(id: number): Promise<PipelineExecution | undefined>;
  createPipelineExecution(execution: InsertPipelineExecution): Promise<PipelineExecution>;
  updatePipelineExecution(id: number, execution: Partial<PipelineExecution>): Promise<PipelineExecution | undefined>;
  
  // Shared pipeline operations
  getSharedPipelines(): Promise<any[]>; // Extended type with user info
  getSharedPipelineCount(): Promise<number>;
  sharePipeline(sharedPipeline: InsertSharedPipeline): Promise<SharedPipeline>;
  
  // Team member operations
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mopFiles: Map<number, MopFile>;
  private pipelines: Map<number, Pipeline>;
  private pipelineSteps: Map<number, PipelineStep>;
  private pipelineExecutions: Map<number, PipelineExecution>;
  private sharedPipelines: Map<number, SharedPipeline>;
  private teamMembers: Map<number, TeamMember>;
  
  private currentUserId: number;
  private currentMopFileId: number;
  private currentPipelineId: number;
  private currentPipelineStepId: number;
  private currentPipelineExecutionId: number;
  private currentSharedPipelineId: number;
  private currentTeamMemberId: number;

  constructor() {
    this.users = new Map();
    this.mopFiles = new Map();
    this.pipelines = new Map();
    this.pipelineSteps = new Map();
    this.pipelineExecutions = new Map();
    this.sharedPipelines = new Map();
    this.teamMembers = new Map();
    
    this.currentUserId = 1;
    this.currentMopFileId = 1;
    this.currentPipelineId = 1;
    this.currentPipelineStepId = 1;
    this.currentPipelineExecutionId = 1;
    this.currentSharedPipelineId = 1;
    this.currentTeamMemberId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add a sample user
    const user: User = {
      id: this.currentUserId++,
      username: 'johndoe',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@devplatform.co',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Add some sample MOP files
    const sampleMopContents = [
      `# Data Cleaning Pipeline
steps:
  - name: Import CSV
    type: data_import
    source: s3://data-bucket/raw_data.csv
  - name: Clean Missing Values
    type: transform
    method: fillna
    columns: ['age', 'income']
  - name: Export Clean Data
    type: data_export
    target: s3://data-bucket/cleaned_data.csv`,
      
      `# Machine Learning Training
steps:
  - name: Load Dataset
    type: data_import
    source: local://datasets/train.csv
  - name: Feature Engineering
    type: transform
    methods: 
      - one_hot_encoding
      - scaling
  - name: Train Model
    type: ml_train
    algorithm: xgboost
    parameters:
      learning_rate: 0.1
      max_depth: 5
  - name: Evaluate Model
    type: ml_evaluate
    metrics: ['accuracy', 'f1_score']
  - name: Save Model
    type: model_save
    path: s3://models/xgboost_v1.pkl`,
      
      `# API Deployment Workflow
steps:
  - name: Test API
    type: api_test
    endpoint: /predict
    method: POST
    payload:
      features: [1.2, 3.4, 2.1, 0.5]
  - name: Build Docker Image
    type: docker_build
    dockerfile: ./Dockerfile
    tag: prediction-api:v1.0
  - name: Deploy to K8s
    type: k8s_deploy
    manifest: ./k8s/deployment.yaml
    namespace: production
  - name: Verify Deployment
    type: health_check
    url: https://api.example.com/health
    timeout: 30`
    ];
    
    const sampleMopFileNames = [
      'Data Cleaning Pipeline',
      'ML Training Pipeline',
      'API Deployment Workflow'
    ];
    
    for (let i = 0; i < sampleMopFileNames.length; i++) {
      const mopFile: MopFile = {
        id: this.currentMopFileId++,
        userId: user.id,
        name: sampleMopFileNames[i],
        description: `Description for ${sampleMopFileNames[i]}`,
        content: sampleMopContents[i],
        createdAt: new Date(Date.now() - i * 86400000),
        updatedAt: new Date(Date.now() - i * 86400000)
      };
      this.mopFiles.set(mopFile.id, mopFile);
    }
    
    // Add some sample pipelines
    const samplePipelines = [
      {
        name: 'Data Preprocessing',
        description: 'Pipeline for cleaning and preprocessing raw data',
        mopFileId: 1,
        status: 'active'
      },
      {
        name: 'Model Training',
        description: 'End-to-end ML model training pipeline',
        mopFileId: 2,
        status: 'draft'
      },
      {
        name: 'Deployment Pipeline',
        description: 'CI/CD pipeline for API deployment',
        mopFileId: 3,
        status: 'active'
      }
    ];
    
    for (const pipelineData of samplePipelines) {
      const pipeline: Pipeline = {
        id: this.currentPipelineId++,
        userId: user.id,
        name: pipelineData.name,
        description: pipelineData.description,
        mopFileId: pipelineData.mopFileId,
        status: pipelineData.status,
        config: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.pipelines.set(pipeline.id, pipeline);
    }
    
    // Add pipeline steps
    const stepTypes = ['data_import', 'transform', 'data_export', 'ml_train', 'ml_evaluate', 'api_test', 'docker_build'];
    
    for (let i = 1; i <= 3; i++) {
      for (let j = 0; j < 3; j++) {
        const stepType = stepTypes[(i + j) % stepTypes.length];
        const pipelineStep: PipelineStep = {
          id: this.currentPipelineStepId++,
          pipelineId: i,
          name: `Step ${j + 1}`,
          type: stepType,
          config: { enabled: true },
          position: j,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.pipelineSteps.set(pipelineStep.id, pipelineStep);
      }
    }
    
    // Add pipeline executions
    for (let i = 1; i <= 3; i++) {
      const statuses = ['completed', 'failed', 'running'];
      for (let j = 0; j < 2; j++) {
        const execution: PipelineExecution = {
          id: this.currentPipelineExecutionId++,
          pipelineId: i,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          startedAt: new Date(Date.now() - (i + j) * 3600000),
          completedAt: j === 0 ? new Date(Date.now() - (i + j) * 3600000 + 1200000) : undefined,
          logs: j === 0 ? "Pipeline executed successfully" : "Pipeline execution in progress",
          results: j === 0 ? { success: true, metrics: { duration: 1200 } } : {}
        };
        this.pipelineExecutions.set(execution.id, execution);
      }
    }
    
    // Add some sample team members
    const sampleTeamMembers = [
      { name: 'Alice Smith', email: 'alice@devplatform.co', role: 'developer' },
      { name: 'Robert Johnson', email: 'robert@devplatform.co', role: 'data_scientist' },
      { name: 'Emma Lee', email: 'emma@devplatform.co', role: 'admin' }
    ];
    
    for (const memberData of sampleTeamMembers) {
      const teamMember: TeamMember = {
        id: this.currentTeamMemberId++,
        userId: user.id,
        name: memberData.name,
        email: memberData.email,
        role: memberData.role,
        createdAt: new Date()
      };
      this.teamMembers.set(teamMember.id, teamMember);
    }
    
    // Add some shared pipelines
    for (let i = 1; i <= 3; i++) {
      const sharedPipeline: SharedPipeline = {
        id: this.currentSharedPipelineId++,
        pipelineId: i,
        sharedByUserId: user.id,
        sharedWithUserId: user.id, // Sharing with self for sample
        permissions: i === 1 ? "edit" : "view",
        sharedAt: new Date(Date.now() - i * 43200000)
      };
      this.sharedPipelines.set(sharedPipeline.id, sharedPipeline);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // MOP file operations
  async getAllMopFiles(): Promise<MopFile[]> {
    return Array.from(this.mopFiles.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getRecentMopFiles(limit = 5): Promise<MopFile[]> {
    return Array.from(this.mopFiles.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async getMopFile(id: number): Promise<MopFile | undefined> {
    return this.mopFiles.get(id);
  }
  
  async getMopFileCount(): Promise<number> {
    return this.mopFiles.size;
  }
  
  async createMopFile(insertMopFile: InsertMopFile): Promise<MopFile> {
    const id = this.currentMopFileId++;
    const mopFile: MopFile = {
      ...insertMopFile,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mopFiles.set(id, mopFile);
    return mopFile;
  }
  
  // Pipeline operations
  async getAllPipelines(): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getPipeline(id: number): Promise<Pipeline | undefined> {
    return this.pipelines.get(id);
  }
  
  async getPipelineCount(): Promise<number> {
    return this.pipelines.size;
  }
  
  async getPipelineStepCount(pipelineId: number): Promise<number> {
    return Array.from(this.pipelineSteps.values())
      .filter(step => step.pipelineId === pipelineId)
      .length;
  }
  
  async createPipeline(insertPipeline: InsertPipeline): Promise<Pipeline> {
    const id = this.currentPipelineId++;
    const pipeline: Pipeline = {
      ...insertPipeline,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(id, pipeline);
    return pipeline;
  }
  
  // Pipeline steps operations
  async getPipelineSteps(pipelineId: number): Promise<PipelineStep[]> {
    return Array.from(this.pipelineSteps.values())
      .filter(step => step.pipelineId === pipelineId)
      .sort((a, b) => a.position - b.position);
  }
  
  async createPipelineStep(insertStep: InsertPipelineStep): Promise<PipelineStep> {
    const id = this.currentPipelineStepId++;
    const step: PipelineStep = {
      ...insertStep,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelineSteps.set(id, step);
    return step;
  }
  
  async updatePipelineStep(id: number, updateData: Partial<PipelineStep>): Promise<PipelineStep | undefined> {
    const step = this.pipelineSteps.get(id);
    if (!step) return undefined;
    
    const updatedStep: PipelineStep = {
      ...step,
      ...updateData,
      updatedAt: new Date()
    };
    this.pipelineSteps.set(id, updatedStep);
    return updatedStep;
  }
  
  async deletePipelineStep(id: number): Promise<boolean> {
    return this.pipelineSteps.delete(id);
  }
  
  // Pipeline execution operations
  async getAllPipelineExecutions(pipelineId: number): Promise<PipelineExecution[]> {
    return Array.from(this.pipelineExecutions.values())
      .filter(execution => execution.pipelineId === pipelineId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }
  
  async getRecentPipelineExecutions(pipelineId: number, limit = 5): Promise<PipelineExecution[]> {
    return Array.from(this.pipelineExecutions.values())
      .filter(execution => execution.pipelineId === pipelineId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }
  
  async getPipelineExecution(id: number): Promise<PipelineExecution | undefined> {
    return this.pipelineExecutions.get(id);
  }
  
  async createPipelineExecution(insertExecution: InsertPipelineExecution): Promise<PipelineExecution> {
    const id = this.currentPipelineExecutionId++;
    const execution: PipelineExecution = {
      ...insertExecution,
      id,
      startedAt: new Date()
    };
    this.pipelineExecutions.set(id, execution);
    return execution;
  }
  
  async updatePipelineExecution(id: number, updateData: Partial<PipelineExecution>): Promise<PipelineExecution | undefined> {
    const execution = this.pipelineExecutions.get(id);
    if (!execution) return undefined;
    
    const updatedExecution: PipelineExecution = {
      ...execution,
      ...updateData
    };
    this.pipelineExecutions.set(id, updatedExecution);
    return updatedExecution;
  }
  
  // Shared pipeline operations
  async getSharedPipelines(): Promise<any[]> {
    const sharedPipelines = Array.from(this.sharedPipelines.values());
    
    return Promise.all(
      sharedPipelines.map(async (shared) => {
        const pipeline = await this.getPipeline(shared.pipelineId);
        const sharedByUser = await this.getUser(shared.sharedByUserId);
        
        if (!pipeline || !sharedByUser) return null;
        
        return {
          id: shared.id,
          ...pipeline,
          sharedBy: `${sharedByUser.firstName} ${sharedByUser.lastName}`,
          sharedAt: shared.sharedAt,
          permissions: shared.permissions
        };
      })
    ).then(results => results.filter(result => result !== null) as any[]);
  }
  
  async getSharedPipelineCount(): Promise<number> {
    return this.sharedPipelines.size;
  }
  
  async sharePipeline(insertSharedPipeline: InsertSharedPipeline): Promise<SharedPipeline> {
    const id = this.currentSharedPipelineId++;
    const sharedPipeline: SharedPipeline = {
      ...insertSharedPipeline,
      id,
      sharedAt: new Date()
    };
    this.sharedPipelines.set(id, sharedPipeline);
    return sharedPipeline;
  }
  
  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }
  
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }
  
  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.currentTeamMemberId++;
    const teamMember: TeamMember = {
      ...insertTeamMember,
      id,
      createdAt: new Date()
    };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }
}

// Import and use the DatabaseStorage instead of MemStorage
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();
