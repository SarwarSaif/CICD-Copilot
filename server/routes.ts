import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import multer from "multer";
import path from "path";
import { 
  insertMopFileSchema, 
  insertPipelineSchema, 
  insertPipelineStepSchema, 
  insertPipelineExecutionSchema,
  insertSharedPipelineSchema, 
  insertTeamMemberSchema 
} from "@shared/schema";
import { convertToJenkinsPipeline } from "./jenkins-converter";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['text/plain', 'text/yaml', 'text/x-yaml', 'application/x-yaml', 'application/yaml'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.yaml') || file.originalname.endsWith('.yml') || file.originalname.endsWith('.mop')) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only MOP files, YAML, or plain text files are allowed.`));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get('/api/auth/me', (req, res) => {
    // Mock current user for development
    const currentUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@devplatform.co',
      username: 'johndoe',
    };
    
    res.json(currentUser);
  });

  // Stats route
  app.get('/api/stats', async (req, res) => {
    const totalMopFiles = await storage.getMopFileCount();
    const pipelines = await storage.getPipelineCount();
    const shared = await storage.getSharedPipelineCount();
    
    res.json({
      totalMopFiles,
      pipelines,
      shared
    });
  });

  // MOP file routes
  app.get('/api/mop-files', async (req, res) => {
    const mopFiles = await storage.getAllMopFiles();
    res.json(mopFiles);
  });

  app.get('/api/mop-files/recent', async (req, res) => {
    const recentMopFiles = await storage.getRecentMopFiles();
    res.json(recentMopFiles);
  });

  app.get('/api/mop-files/:id', async (req, res) => {
    const mopFile = await storage.getMopFile(parseInt(req.params.id));
    if (!mopFile) {
      return res.status(404).json({ error: 'MOP file not found' });
    }
    res.json(mopFile);
  });

  app.post('/api/mop-files/upload', upload.single('mopFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      
      const mopFileData = {
        userId: 1, // Mocked user ID
        name: req.body.name || req.file.originalname.replace(/\.[^/.]+$/, "") || 'Untitled',
        description: req.body.description || '',
        content: fileContent,
      };
      
      const parsedMopFileData = insertMopFileSchema.parse(mopFileData);
      const mopFile = await storage.createMopFile(parsedMopFileData);
      
      res.status(201).json(mopFile);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Pipeline routes
  app.get('/api/pipelines', async (req, res) => {
    const pipelines = await storage.getAllPipelines();
    
    // Get step count for each pipeline
    const pipelinesWithCount = await Promise.all(
      pipelines.map(async (pipeline) => {
        const stepCount = await storage.getPipelineStepCount(pipeline.id);
        const mopFile = await storage.getMopFile(pipeline.mopFileId);
        return {
          ...pipeline,
          stepCount,
          mopFileName: mopFile?.name || 'Unknown',
          // Mock sharing for development
          sharedWith: Math.floor(Math.random() * 5)
        };
      })
    );
    
    res.json(pipelinesWithCount);
  });

  app.get('/api/pipelines/:id', async (req, res) => {
    const pipeline = await storage.getPipeline(parseInt(req.params.id));
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    
    // Get the associated MOP file
    const mopFile = await storage.getMopFile(pipeline.mopFileId);
    
    // Get pipeline steps
    const steps = await storage.getPipelineSteps(pipeline.id);
    
    // Get recent executions
    const recentExecutions = await storage.getRecentPipelineExecutions(pipeline.id, 3);
    
    res.json({
      ...pipeline,
      mopFile,
      steps,
      recentExecutions
    });
  });
  
  // Get Jenkins pipeline code for a pipeline
  app.get('/api/pipelines/:id/jenkins_pipeline', async (req, res) => {
    try {
      const pipeline = await storage.getPipeline(parseInt(req.params.id));
      if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }
      
      // Get the associated MOP file
      const mopFile = await storage.getMopFile(pipeline.mopFileId);
      const mopContent = mopFile ? mopFile.content : '';
      
      // Convert to Jenkins pipeline
      const jenkinsCode = convertToJenkinsPipeline(mopContent, pipeline);
      
      res.json({ jenkins_code: jenkinsCode });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });
  
  // Update Jenkins pipeline code for a pipeline
  app.post('/api/pipelines/:id/update_jenkins_code', express.json(), async (req, res) => {
    try {
      const pipeline = await storage.getPipeline(parseInt(req.params.id));
      if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }
      
      const { jenkins_code } = req.body;
      if (!jenkins_code) {
        return res.status(400).json({ error: 'Jenkins pipeline code is required' });
      }
      
      // Update the pipeline config with the Jenkins code
      const updatedConfig = {
        ...(pipeline.config || {}),
        jenkins_code
      };
      
      // Save the updated pipeline
      pipeline.config = updatedConfig;
      // Note: In a real implementation, you would update the pipeline in the database
      // Since we don't have a database update method in the storage interface, we'll just return the pipeline
      
      res.json({
        message: 'Jenkins pipeline code updated successfully',
        pipeline
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  app.post('/api/pipelines', express.json(), async (req, res) => {
    try {
      const pipelineData = {
        userId: 1, // Mocked user ID
        name: req.body.name,
        description: req.body.description || '',
        mopFileId: req.body.mopFileId,
        status: req.body.status || 'draft',
        config: req.body.config || {},
      };
      
      const parsedPipelineData = insertPipelineSchema.parse(pipelineData);
      const pipeline = await storage.createPipeline(parsedPipelineData);
      
      res.status(201).json(pipeline);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Pipeline steps routes
  app.get('/api/pipelines/:pipelineId/steps', async (req, res) => {
    const pipelineSteps = await storage.getPipelineSteps(parseInt(req.params.pipelineId));
    res.json(pipelineSteps);
  });

  app.post('/api/pipeline-steps', express.json(), async (req, res) => {
    try {
      const stepData = {
        pipelineId: req.body.pipelineId,
        name: req.body.name,
        type: req.body.type,
        config: req.body.config || {},
        position: req.body.position,
      };
      
      const parsedStepData = insertPipelineStepSchema.parse(stepData);
      const step = await storage.createPipelineStep(parsedStepData);
      
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Pipeline execution routes
  app.get('/api/pipelines/:pipelineId/executions', async (req, res) => {
    const executions = await storage.getAllPipelineExecutions(parseInt(req.params.pipelineId));
    res.json(executions);
  });

  app.post('/api/pipeline-executions', express.json(), async (req, res) => {
    try {
      const executionData = {
        pipelineId: req.body.pipelineId,
        status: 'running', // Always start as running
        logs: '',
        results: {},
      };
      
      const parsedExecutionData = insertPipelineExecutionSchema.parse(executionData);
      const execution = await storage.createPipelineExecution(parsedExecutionData);
      
      // In a real system, we would start an actual execution process here
      // For this demo, we'll simulate an execution process that updates status after a delay
      setTimeout(async () => {
        const success = Math.random() > 0.3; // 70% chance of success
        await storage.updatePipelineExecution(execution.id, {
          status: success ? 'completed' : 'failed',
          completedAt: new Date(),
          logs: success ? 'Pipeline executed successfully' : 'Pipeline execution failed: Error in step 2',
          results: success ? { success: true, metrics: { duration: Math.floor(Math.random() * 2000) + 500 } } : { success: false, error: 'Step 2 failed with code 1' }
        });
      }, 5000); // Simulate 5 seconds of execution time
      
      res.status(201).json(execution);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Shared pipeline routes
  app.get('/api/pipelines/shared', async (req, res) => {
    const sharedPipelines = await storage.getSharedPipelines();
    res.json(sharedPipelines);
  });

  app.post('/api/pipelines/share', express.json(), async (req, res) => {
    try {
      const sharedPipelineData = {
        pipelineId: req.body.pipelineId,
        sharedByUserId: 1, // Mocked user ID
        sharedWithUserId: req.body.sharedWithUserId,
        permissions: req.body.permissions || 'view',
      };
      
      const parsedSharedPipelineData = insertSharedPipelineSchema.parse(sharedPipelineData);
      const sharedPipeline = await storage.sharePipeline(parsedSharedPipelineData);
      
      res.status(201).json(sharedPipeline);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Team members route
  app.get('/api/team', async (req, res) => {
    const teamMembers = await storage.getAllTeamMembers();
    res.json(teamMembers);
  });
  
  // Integration settings endpoints
  app.get('/api/integration-settings/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const settings = await storage.getIntegrationSettings(userId);
      
      if (!settings) {
        // Return empty settings if none found
        return res.json({
          userId,
          jenkinsUrl: '',
          jenkinsUsername: '',
          jenkinsToken: '',
          jenkinsJobTemplate: '',
          githubUrl: '',
          githubUsername: '',
          githubToken: '',
          githubRepository: '',
          githubBranch: 'main'
        });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });
  
  app.post('/api/integration-settings/:userId', express.json(), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const settings = req.body;
      settings.userId = userId; // Ensure the userId is set correctly
      
      const updatedSettings = await storage.updateIntegrationSettings(userId, settings);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
