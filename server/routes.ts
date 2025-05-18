import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import multer from "multer";
import path from "path";
import { insertPhotoSchema, insertCollectionSchema, insertSharedPhotoSchema, insertTeamMemberSchema } from "@shared/schema";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/heic'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`));
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
      email: 'john@remotework.co',
      username: 'johndoe',
    };
    
    res.json(currentUser);
  });

  // Stats route
  app.get('/api/stats', async (req, res) => {
    const totalPhotos = await storage.getPhotoCount();
    const collections = await storage.getCollectionCount();
    const shared = await storage.getSharedPhotoCount();
    
    res.json({
      totalPhotos,
      collections,
      shared
    });
  });

  // Photo routes
  app.get('/api/photos', async (req, res) => {
    const photos = await storage.getAllPhotos();
    res.json(photos);
  });

  app.get('/api/photos/recent', async (req, res) => {
    const recentPhotos = await storage.getRecentPhotos();
    res.json(recentPhotos);
  });

  app.get('/api/photos/shared', async (req, res) => {
    const sharedPhotos = await storage.getSharedPhotos();
    res.json(sharedPhotos);
  });

  app.post('/api/photos/upload', upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // In a real app, we would save the file to storage and get a URL
      // For this MVP, we're creating a local URL
      const fileName = `photo-${Date.now()}${path.extname(req.file.originalname)}`;
      
      // Mocking the URL for development
      const photoUrl = `https://source.unsplash.com/random/800x800/?workspace`;
      
      const photoData = {
        userId: 1, // Mocked user ID
        title: req.file.originalname.replace(/\.[^/.]+$/, "") || 'Untitled',
        description: '',
        url: photoUrl,
      };
      
      const parsedPhotoData = insertPhotoSchema.parse(photoData);
      const photo = await storage.createPhoto(parsedPhotoData);
      
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  // Collection routes
  app.get('/api/collections', async (req, res) => {
    const collections = await storage.getAllCollections();
    
    // Get photo count for each collection
    const collectionsWithCount = await Promise.all(
      collections.map(async (collection) => {
        const photoCount = await storage.getCollectionPhotoCount(collection.id);
        return {
          ...collection,
          photoCount,
          // Mock sharing for development
          sharedWith: Math.floor(Math.random() * 10)
        };
      })
    );
    
    res.json(collectionsWithCount);
  });

  app.post('/api/collections', express.json(), async (req, res) => {
    try {
      const collectionData = {
        userId: 1, // Mocked user ID
        name: req.body.name,
        description: req.body.description || '',
        coverUrl: req.body.coverUrl || '',
      };
      
      const parsedCollectionData = insertCollectionSchema.parse(collectionData);
      const collection = await storage.createCollection(parsedCollectionData);
      
      res.status(201).json(collection);
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

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
