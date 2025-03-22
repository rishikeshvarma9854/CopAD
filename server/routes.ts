import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAdCopy } from "./openai";
import { generateAdCopySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to generate ad copy
  app.post("/api/generate-ad-copy", async (req, res) => {
    try {
      // Validate request body
      const validated = generateAdCopySchema.parse(req.body);
      
      // Generate ad copy using OpenAI
      const generatedCopies = await generateAdCopy(validated);
      
      // Store the generated ad copy in the database
      const adCopy = await storage.createAdCopy({
        ...validated,
        generatedCopies: JSON.stringify(generatedCopies),
      });
      
      return res.json({ 
        success: true, 
        data: {
          id: adCopy.id,
          createdAt: adCopy.createdAt,
          copies: generatedCopies
        }
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to generate ad copy" 
      });
    }
  });

  // API route to get ad copy history
  app.get("/api/ad-copy-history", async (req, res) => {
    try {
      const history = await storage.getAdCopyHistory();
      
      // Transform history items to include parsed copies
      const formattedHistory = history.map(item => ({
        id: item.id,
        productName: item.productName,
        brandName: item.brandName,
        platform: item.platform,
        tone: item.tone,
        ageRange: item.ageRange,
        createdAt: item.createdAt,
        copies: JSON.parse(item.generatedCopies)
      }));
      
      return res.json({ success: true, data: formattedHistory });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: (error as Error).message || "Failed to fetch ad copy history" 
      });
    }
  });

  // API route to clear ad copy history
  app.delete("/api/ad-copy-history", async (req, res) => {
    try {
      await storage.clearAdCopyHistory();
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: (error as Error).message || "Failed to clear history" 
      });
    }
  });
  
  // API route to get a specific ad copy by ID
  app.get("/api/ad-copy/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid ID format" 
        });
      }
      
      const adCopy = await storage.getAdCopyById(id);
      if (!adCopy) {
        return res.status(404).json({ 
          success: false, 
          message: "Ad copy not found" 
        });
      }
      
      return res.json({ 
        success: true, 
        data: {
          ...adCopy,
          copies: JSON.parse(adCopy.generatedCopies)
        } 
      });
    } catch (error: any) {
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to fetch ad copy" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
