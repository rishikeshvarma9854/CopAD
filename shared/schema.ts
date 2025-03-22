import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Ad copy schema
export const adCopies = pgTable("ad_copies", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  brandName: text("brand_name").notNull(),
  productDescription: text("product_description").notNull(),
  keyFeatures: text("key_features"),
  ageRange: text("age_range"),
  gender: text("gender"),
  interests: text("interests"),
  tone: text("tone").notNull(),
  platform: text("platform").notNull(),
  variations: integer("variations").default(3),
  generatedCopies: text("generated_copies").notNull(), // JSON stringified array of copies
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdCopySchema = createInsertSchema(adCopies).omit({
  id: true,
  createdAt: true,
});

export type InsertAdCopy = z.infer<typeof insertAdCopySchema>;
export type AdCopy = typeof adCopies.$inferSelect;

// Schema for generating ad copy
export const generateAdCopySchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  brandName: z.string().min(1, "Brand name is required"),
  productDescription: z.string().min(10, "Product description is required"),
  keyFeatures: z.string().optional(),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  interests: z.string().optional(),
  tone: z.string().min(1, "Tone is required"),
  platform: z.string().min(1, "Platform is required"),
  variations: z.number().min(1).max(10).default(3),
});

export type GenerateAdCopyParams = z.infer<typeof generateAdCopySchema>;

// Generated ad copy type
export interface GeneratedAdCopy {
  headline: string;
  body: string;
  platform: string;
}
