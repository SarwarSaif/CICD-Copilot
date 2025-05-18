import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
});

// Mop files table (replaces photos)
export const mopFiles = pgTable("mop_files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMopFileSchema = createInsertSchema(mopFiles).pick({
  userId: true,
  name: true,
  description: true,
  content: true,
});

// Pipeline table (replaces collections)
export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  mopFileId: integer("mop_file_id").notNull().references(() => mopFiles.id),
  status: text("status").notNull().default("draft"),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPipelineSchema = createInsertSchema(pipelines).pick({
  userId: true,
  name: true,
  description: true,
  mopFileId: true,
  status: true,
  config: true,
});

// Pipeline steps table
export const pipelineSteps = pgTable("pipeline_steps", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").notNull().references(() => pipelines.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPipelineStepSchema = createInsertSchema(pipelineSteps).pick({
  pipelineId: true,
  name: true,
  type: true,
  config: true,
  position: true,
});

// Pipeline executions table
export const pipelineExecutions = pgTable("pipeline_executions", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").notNull().references(() => pipelines.id),
  status: text("status").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  logs: text("logs"),
  results: jsonb("results").default({}),
});

export const insertPipelineExecutionSchema = createInsertSchema(pipelineExecutions).pick({
  pipelineId: true,
  status: true,
  logs: true,
  results: true,
});

// Shared pipelines table (replaces shared photos)
export const sharedPipelines = pgTable("shared_pipelines", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").notNull().references(() => pipelines.id),
  sharedByUserId: integer("shared_by_user_id").notNull().references(() => users.id),
  sharedWithUserId: integer("shared_with_user_id").notNull().references(() => users.id),
  permissions: text("permissions").notNull().default("view"),
  sharedAt: timestamp("shared_at").defaultNow(),
});

export const insertSharedPipelineSchema = createInsertSchema(sharedPipelines).pick({
  pipelineId: true,
  sharedByUserId: true,
  sharedWithUserId: true,
  permissions: true,
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  userId: true,
  name: true,
  email: true,
  role: true,
});

// Integration settings for Jenkins and GitHub
export const integrationSettings = pgTable("integration_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  jenkinsUrl: text("jenkins_url"),
  jenkinsUsername: text("jenkins_username"),
  jenkinsToken: text("jenkins_token"),
  jenkinsJobTemplate: text("jenkins_job_template"),
  githubUrl: text("github_url"),
  githubUsername: text("github_username"),
  githubToken: text("github_token"),
  githubRepository: text("github_repository"),
  githubBranch: text("github_branch").default("main"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIntegrationSettingsSchema = createInsertSchema(integrationSettings).pick({
  userId: true,
  jenkinsUrl: true,
  jenkinsUsername: true,
  jenkinsToken: true,
  jenkinsJobTemplate: true,
  githubUrl: true,
  githubUsername: true,
  githubToken: true,
  githubRepository: true,
  githubBranch: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MopFile = typeof mopFiles.$inferSelect;
export type InsertMopFile = z.infer<typeof insertMopFileSchema>;

export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;

export type PipelineStep = typeof pipelineSteps.$inferSelect;
export type InsertPipelineStep = z.infer<typeof insertPipelineStepSchema>;

export type PipelineExecution = typeof pipelineExecutions.$inferSelect;
export type InsertPipelineExecution = z.infer<typeof insertPipelineExecutionSchema>;

export type SharedPipeline = typeof sharedPipelines.$inferSelect;
export type InsertSharedPipeline = z.infer<typeof insertSharedPipelineSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type IntegrationSettings = typeof integrationSettings.$inferSelect;
export type InsertIntegrationSettings = z.infer<typeof insertIntegrationSettingsSchema>;
