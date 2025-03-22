import { adCopies, type AdCopy, type InsertAdCopy, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Maintain the same interface
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

// Rewrite storage implementation to use PostgreSQL via Drizzle
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Ad copy methods
  async createAdCopy(insertAdCopy: InsertAdCopy): Promise<AdCopy> {
    // Current timestamp will be automatically handled by PostgreSQL
    const [adCopy] = await db.insert(adCopies).values({
      productName: insertAdCopy.productName,
      brandName: insertAdCopy.brandName,
      productDescription: insertAdCopy.productDescription,
      keyFeatures: insertAdCopy.keyFeatures,
      ageRange: insertAdCopy.ageRange,
      gender: insertAdCopy.gender,
      interests: insertAdCopy.interests,
      tone: insertAdCopy.tone,
      platform: insertAdCopy.platform,
      variations: insertAdCopy.variations ?? 3,
      generatedCopies: insertAdCopy.generatedCopies
    }).returning();
    
    return adCopy;
  }

  async getAdCopyById(id: number): Promise<AdCopy | undefined> {
    const [adCopy] = await db.select().from(adCopies).where(eq(adCopies.id, id));
    return adCopy;
  }

  async getAdCopyHistory(): Promise<AdCopy[]> {
    // Return sorted by creation date (newest first)
    return await db.select().from(adCopies).orderBy(desc(adCopies.createdAt));
  }

  async clearAdCopyHistory(): Promise<void> {
    await db.delete(adCopies);
  }
}

// Export a new DatabaseStorage instance
export const storage = new DatabaseStorage();
