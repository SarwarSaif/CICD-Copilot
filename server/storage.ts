import { 
  User, InsertUser, 
  Photo, InsertPhoto, 
  Collection, InsertCollection,
  CollectionPhoto, InsertCollectionPhoto,
  SharedPhoto, InsertSharedPhoto,
  TeamMember, InsertTeamMember
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Photo operations
  getAllPhotos(): Promise<Photo[]>;
  getRecentPhotos(limit?: number): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  getPhotoCount(): Promise<number>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Collection operations
  getAllCollections(): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  getCollectionCount(): Promise<number>;
  getCollectionPhotoCount(collectionId: number): Promise<number>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  
  // Collection photo operations
  addPhotoToCollection(collectionPhoto: InsertCollectionPhoto): Promise<CollectionPhoto>;
  removePhotoFromCollection(collectionId: number, photoId: number): Promise<void>;
  getCollectionPhotos(collectionId: number): Promise<Photo[]>;
  
  // Shared photo operations
  getSharedPhotos(): Promise<any[]>; // Extended type with user info
  getSharedPhotoCount(): Promise<number>;
  sharePhoto(sharedPhoto: InsertSharedPhoto): Promise<SharedPhoto>;
  
  // Team member operations
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private photos: Map<number, Photo>;
  private collections: Map<number, Collection>;
  private collectionPhotos: Map<number, CollectionPhoto>;
  private sharedPhotos: Map<number, SharedPhoto>;
  private teamMembers: Map<number, TeamMember>;
  
  private currentUserId: number;
  private currentPhotoId: number;
  private currentCollectionId: number;
  private currentCollectionPhotoId: number;
  private currentSharedPhotoId: number;
  private currentTeamMemberId: number;

  constructor() {
    this.users = new Map();
    this.photos = new Map();
    this.collections = new Map();
    this.collectionPhotos = new Map();
    this.sharedPhotos = new Map();
    this.teamMembers = new Map();
    
    this.currentUserId = 1;
    this.currentPhotoId = 1;
    this.currentCollectionId = 1;
    this.currentCollectionPhotoId = 1;
    this.currentSharedPhotoId = 1;
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
      email: 'john@remotework.co',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Add some sample photos
    const samplePhotoUrls = [
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659',
      'https://images.unsplash.com/photo-1593476550610-87baa860004a',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
    ];
    
    const samplePhotoTitles = [
      'Workspace Setup',
      'Mountain Retreat',
      'Cafe Morning',
      'Home Office',
      'Team Meeting'
    ];
    
    for (let i = 0; i < samplePhotoUrls.length; i++) {
      const photo: Photo = {
        id: this.currentPhotoId++,
        userId: user.id,
        title: samplePhotoTitles[i],
        description: `Description for ${samplePhotoTitles[i]}`,
        url: `${samplePhotoUrls[i]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800`,
        createdAt: new Date(Date.now() - i * 86400000),
        updatedAt: new Date(Date.now() - i * 86400000)
      };
      this.photos.set(photo.id, photo);
    }
    
    // Add some sample collections
    const sampleCollections = [
      {
        name: 'Workspaces',
        coverUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340'
      },
      {
        name: 'Travel Destinations',
        coverUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340'
      },
      {
        name: 'Team Meetings',
        coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=340'
      }
    ];
    
    for (const collectionData of sampleCollections) {
      const collection: Collection = {
        id: this.currentCollectionId++,
        userId: user.id,
        name: collectionData.name,
        description: `A collection of ${collectionData.name.toLowerCase()}`,
        coverUrl: collectionData.coverUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.collections.set(collection.id, collection);
    }
    
    // Add photos to collections
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= Math.min(this.currentPhotoId - 1, 3); j++) {
        if ((i + j) % 3 === 0) {
          const collectionPhoto: CollectionPhoto = {
            id: this.currentCollectionPhotoId++,
            collectionId: i,
            photoId: j,
            addedAt: new Date()
          };
          this.collectionPhotos.set(collectionPhoto.id, collectionPhoto);
        }
      }
    }
    
    // Add some sample team members
    const sampleTeamMembers = [
      { name: 'Alice Smith', email: 'alice@remotework.co' },
      { name: 'Robert Johnson', email: 'robert@remotework.co' },
      { name: 'Emma Lee', email: 'emma@remotework.co' }
    ];
    
    for (const memberData of sampleTeamMembers) {
      const teamMember: TeamMember = {
        id: this.currentTeamMemberId++,
        userId: user.id,
        name: memberData.name,
        email: memberData.email,
        createdAt: new Date()
      };
      this.teamMembers.set(teamMember.id, teamMember);
    }
    
    // Add some shared photos
    for (let i = 1; i <= 3; i++) {
      const sharedPhoto: SharedPhoto = {
        id: this.currentSharedPhotoId++,
        photoId: i,
        sharedByUserId: user.id,
        sharedWithUserId: user.id, // Sharing with self for sample
        sharedAt: new Date(Date.now() - i * 43200000)
      };
      this.sharedPhotos.set(sharedPhoto.id, sharedPhoto);
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
  
  // Photo operations
  async getAllPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getRecentPhotos(limit = 5): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }
  
  async getPhotoCount(): Promise<number> {
    return this.photos.size;
  }
  
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo: Photo = {
      ...insertPhoto,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }
  
  // Collection operations
  async getAllCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getCollection(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }
  
  async getCollectionCount(): Promise<number> {
    return this.collections.size;
  }
  
  async getCollectionPhotoCount(collectionId: number): Promise<number> {
    return Array.from(this.collectionPhotos.values())
      .filter(cp => cp.collectionId === collectionId)
      .length;
  }
  
  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = this.currentCollectionId++;
    const collection: Collection = {
      ...insertCollection,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.set(id, collection);
    return collection;
  }
  
  // Collection photo operations
  async addPhotoToCollection(insertCollectionPhoto: InsertCollectionPhoto): Promise<CollectionPhoto> {
    const id = this.currentCollectionPhotoId++;
    const collectionPhoto: CollectionPhoto = {
      ...insertCollectionPhoto,
      id,
      addedAt: new Date()
    };
    this.collectionPhotos.set(id, collectionPhoto);
    return collectionPhoto;
  }
  
  async removePhotoFromCollection(collectionId: number, photoId: number): Promise<void> {
    const collectionPhotoId = Array.from(this.collectionPhotos.entries())
      .find(([_, cp]) => cp.collectionId === collectionId && cp.photoId === photoId)?.[0];
      
    if (collectionPhotoId) {
      this.collectionPhotos.delete(collectionPhotoId);
    }
  }
  
  async getCollectionPhotos(collectionId: number): Promise<Photo[]> {
    const photoIds = Array.from(this.collectionPhotos.values())
      .filter(cp => cp.collectionId === collectionId)
      .map(cp => cp.photoId);
      
    return photoIds
      .map(id => this.photos.get(id))
      .filter((photo): photo is Photo => photo !== undefined);
  }
  
  // Shared photo operations
  async getSharedPhotos(): Promise<any[]> {
    const sharedPhotos = Array.from(this.sharedPhotos.values());
    
    return Promise.all(
      sharedPhotos.map(async (shared) => {
        const photo = await this.getPhoto(shared.photoId);
        const sharedByUser = await this.getUser(shared.sharedByUserId);
        
        if (!photo || !sharedByUser) return null;
        
        return {
          id: shared.id,
          ...photo,
          sharedBy: `${sharedByUser.firstName} ${sharedByUser.lastName}`,
          sharedAt: shared.sharedAt
        };
      })
    ).then(results => results.filter(result => result !== null) as any[]);
  }
  
  async getSharedPhotoCount(): Promise<number> {
    return this.sharedPhotos.size;
  }
  
  async sharePhoto(insertSharedPhoto: InsertSharedPhoto): Promise<SharedPhoto> {
    const id = this.currentSharedPhotoId++;
    const sharedPhoto: SharedPhoto = {
      ...insertSharedPhoto,
      id,
      sharedAt: new Date()
    };
    this.sharedPhotos.set(id, sharedPhoto);
    return sharedPhoto;
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

export const storage = new MemStorage();
