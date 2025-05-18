import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available but don't throw an error if it's not
const dbUrl = process.env.DATABASE_URL || 'postgres://placeholder:placeholder@placeholder:5432/placeholder';

// Create a placeholder pool that won't be used if we're using in-memory storage
export const pool = new Pool({ 
  connectionString: dbUrl,
  // Don't attempt to connect if we don't have a real DATABASE_URL
  max: process.env.DATABASE_URL ? 10 : 0
});

export const db = drizzle(pool, { schema });