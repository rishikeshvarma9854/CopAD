import { adCopies, type AdCopy, type InsertAdCopy, users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ad copy related methods
  createAdCopy(adCopy: InsertAdCopy): Promise<AdCopy>;
  getAdCopyById(id: number): Promise<AdCopy | undefined>;
  getAdCopyHistory(): Promise<AdCopy[]>;
  clearAdCopyHistory(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private adCopiesMap: Map<number, AdCopy>;
  userCurrentId: number;
  adCopyCurrentId: number;

  constructor() {
    this.users = new Map();
    this.adCopiesMap = new Map();
    this.userCurrentId = 1;
    this.adCopyCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Ad copy methods
  async createAdCopy(insertAdCopy: InsertAdCopy): Promise<AdCopy> {
    const id = this.adCopyCurrentId++;
    const createdAt = new Date();
    
    // Handle optional fields explicitly to satisfy TypeScript
    const adCopy: AdCopy = { 
      id, 
      createdAt,
      productName: insertAdCopy.productName,
      brandName: insertAdCopy.brandName,
      productDescription: insertAdCopy.productDescription,
      keyFeatures: insertAdCopy.keyFeatures ?? null,
      ageRange: insertAdCopy.ageRange ?? null,
      gender: insertAdCopy.gender ?? null,
      interests: insertAdCopy.interests ?? null,
      tone: insertAdCopy.tone,
      platform: insertAdCopy.platform,
      variations: insertAdCopy.variations ?? 3,
      generatedCopies: insertAdCopy.generatedCopies
    };
    
    this.adCopiesMap.set(id, adCopy);
    return adCopy;
  }

  async getAdCopyById(id: number): Promise<AdCopy | undefined> {
    return this.adCopiesMap.get(id);
  }

  async getAdCopyHistory(): Promise<AdCopy[]> {
    // Return sorted by creation date (newest first)
    return Array.from(this.adCopiesMap.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async clearAdCopyHistory(): Promise<void> {
    this.adCopiesMap.clear();
  }
}

export const storage = new MemStorage();
