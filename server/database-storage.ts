import { 
  users, 
  mopFiles, 
  pipelines, 
  pipelineSteps, 
  pipelineExecutions, 
  sharedPipelines, 
  teamMembers,
  type User, 
  type InsertUser,
  type MopFile,
  type InsertMopFile,
  type Pipeline,
  type InsertPipeline,
  type PipelineStep,
  type InsertPipelineStep,
  type PipelineExecution,
  type InsertPipelineExecution,
  type SharedPipeline,
  type InsertSharedPipeline,
  type TeamMember,
  type InsertTeamMember
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // MOP file operations
  async getAllMopFiles(): Promise<MopFile[]> {
    return db.select().from(mopFiles).orderBy(desc(mopFiles.createdAt));
  }
  
  async getRecentMopFiles(limit = 5): Promise<MopFile[]> {
    return db.select()
      .from(mopFiles)
      .orderBy(desc(mopFiles.createdAt))
      .limit(limit);
  }
  
  async getMopFile(id: number): Promise<MopFile | undefined> {
    const [mopFile] = await db.select().from(mopFiles).where(eq(mopFiles.id, id));
    return mopFile || undefined;
  }
  
  async getMopFileCount(): Promise<number> {
    const [result] = await db.select({
      count: count()
    }).from(mopFiles);
    return result.count;
  }
  
  async createMopFile(insertMopFile: InsertMopFile): Promise<MopFile> {
    const [mopFile] = await db
      .insert(mopFiles)
      .values(insertMopFile)
      .returning();
    return mopFile;
  }
  
  // Pipeline operations
  async getAllPipelines(): Promise<Pipeline[]> {
    return db.select().from(pipelines).orderBy(desc(pipelines.createdAt));
  }
  
  async getPipeline(id: number): Promise<Pipeline | undefined> {
    const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.id, id));
    return pipeline || undefined;
  }
  
  async getPipelineCount(): Promise<number> {
    const [result] = await db.select({
      count: count()
    }).from(pipelines);
    return result.count;
  }
  
  async getPipelineStepCount(pipelineId: number): Promise<number> {
    const [result] = await db.select({
      count: count()
    }).from(pipelineSteps).where(eq(pipelineSteps.pipelineId, pipelineId));
    return result.count;
  }
  
  async createPipeline(insertPipeline: InsertPipeline): Promise<Pipeline> {
    const [pipeline] = await db
      .insert(pipelines)
      .values(insertPipeline)
      .returning();
    return pipeline;
  }
  
  // Pipeline steps operations
  async getPipelineSteps(pipelineId: number): Promise<PipelineStep[]> {
    return db.select()
      .from(pipelineSteps)
      .where(eq(pipelineSteps.pipelineId, pipelineId))
      .orderBy(pipelineSteps.position);
  }
  
  async createPipelineStep(insertStep: InsertPipelineStep): Promise<PipelineStep> {
    const [step] = await db
      .insert(pipelineSteps)
      .values(insertStep)
      .returning();
    return step;
  }
  
  async updatePipelineStep(id: number, updateData: Partial<PipelineStep>): Promise<PipelineStep | undefined> {
    const [updatedStep] = await db
      .update(pipelineSteps)
      .set(updateData)
      .where(eq(pipelineSteps.id, id))
      .returning();
    return updatedStep || undefined;
  }
  
  async deletePipelineStep(id: number): Promise<boolean> {
    const [deletedStep] = await db
      .delete(pipelineSteps)
      .where(eq(pipelineSteps.id, id))
      .returning();
    return !!deletedStep;
  }
  
  // Pipeline execution operations
  async getAllPipelineExecutions(pipelineId: number): Promise<PipelineExecution[]> {
    return db.select()
      .from(pipelineExecutions)
      .where(eq(pipelineExecutions.pipelineId, pipelineId))
      .orderBy(desc(pipelineExecutions.startedAt));
  }
  
  async getRecentPipelineExecutions(pipelineId: number, limit = 5): Promise<PipelineExecution[]> {
    return db.select()
      .from(pipelineExecutions)
      .where(eq(pipelineExecutions.pipelineId, pipelineId))
      .orderBy(desc(pipelineExecutions.startedAt))
      .limit(limit);
  }
  
  async getPipelineExecution(id: number): Promise<PipelineExecution | undefined> {
    const [execution] = await db.select()
      .from(pipelineExecutions)
      .where(eq(pipelineExecutions.id, id));
    return execution || undefined;
  }
  
  async createPipelineExecution(insertExecution: InsertPipelineExecution): Promise<PipelineExecution> {
    const [execution] = await db
      .insert(pipelineExecutions)
      .values(insertExecution)
      .returning();
    return execution;
  }
  
  async updatePipelineExecution(id: number, updateData: Partial<PipelineExecution>): Promise<PipelineExecution | undefined> {
    const [updatedExecution] = await db
      .update(pipelineExecutions)
      .set(updateData)
      .where(eq(pipelineExecutions.id, id))
      .returning();
    return updatedExecution || undefined;
  }
  
  // Shared pipeline operations
  async getSharedPipelines(): Promise<any[]> {
    // Join query to get shared pipelines with pipeline and user info
    const result = await db.select({
      id: sharedPipelines.id,
      pipelineId: sharedPipelines.pipelineId,
      name: pipelines.name,
      description: pipelines.description,
      status: pipelines.status,
      sharedBy: users.username,
      sharedAt: sharedPipelines.sharedAt,
      permissions: sharedPipelines.permissions
    })
    .from(sharedPipelines)
    .innerJoin(pipelines, eq(sharedPipelines.pipelineId, pipelines.id))
    .innerJoin(users, eq(sharedPipelines.sharedByUserId, users.id));
    
    return result;
  }
  
  async getSharedPipelineCount(): Promise<number> {
    const [result] = await db.select({
      count: count()
    }).from(sharedPipelines);
    return result.count;
  }
  
  async sharePipeline(insertSharedPipeline: InsertSharedPipeline): Promise<SharedPipeline> {
    const [sharedPipeline] = await db
      .insert(sharedPipelines)
      .values(insertSharedPipeline)
      .returning();
    return sharedPipeline;
  }
  
  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return db.select().from(teamMembers);
  }
  
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const [teamMember] = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id));
    return teamMember || undefined;
  }
  
  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const [teamMember] = await db
      .insert(teamMembers)
      .values(insertTeamMember)
      .returning();
    return teamMember;
  }
}