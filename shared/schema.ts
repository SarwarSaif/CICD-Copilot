import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

// Photo table
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  userId: true,
  title: true,
  description: true,
  url: true,
});

// Collection table
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  userId: true,
  name: true,
  description: true,
  coverUrl: true,
});

// Collection photos junction table (many-to-many)
export const collectionPhotos = pgTable("collection_photos", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull().references(() => collections.id),
  photoId: integer("photo_id").notNull().references(() => photos.id),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertCollectionPhotoSchema = createInsertSchema(collectionPhotos).pick({
  collectionId: true,
  photoId: true,
});

// Shared photos table
export const sharedPhotos = pgTable("shared_photos", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").notNull().references(() => photos.id),
  sharedByUserId: integer("shared_by_user_id").notNull().references(() => users.id),
  sharedWithUserId: integer("shared_with_user_id").notNull().references(() => users.id),
  sharedAt: timestamp("shared_at").defaultNow(),
});

export const insertSharedPhotoSchema = createInsertSchema(sharedPhotos).pick({
  photoId: true,
  sharedByUserId: true,
  sharedWithUserId: true,
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  userId: true,
  name: true,
  email: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

export type CollectionPhoto = typeof collectionPhotos.$inferSelect;
export type InsertCollectionPhoto = z.infer<typeof insertCollectionPhotoSchema>;

export type SharedPhoto = typeof sharedPhotos.$inferSelect;
export type InsertSharedPhoto = z.infer<typeof insertSharedPhotoSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
