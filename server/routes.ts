import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventoryItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all inventory items
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getAllInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  // Get inventory stats
  app.get("/api/inventory/stats", async (req, res) => {
    try {
      const stats = await storage.getInventoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory stats" });
    }
  });

  // Search inventory items
  app.get("/api/inventory/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const items = await storage.searchInventoryItems(query);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to search inventory items" });
    }
  });

  // Filter inventory items
  app.get("/api/inventory/filter", async (req, res) => {
    try {
      const { category, status, year } = req.query;
      const filters: { category?: string; status?: string; year?: number } = {};
      
      if (category) filters.category = category as string;
      if (status) filters.status = status as string;
      if (year) filters.year = parseInt(year as string);
      
      const items = await storage.filterInventoryItems(filters);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter inventory items" });
    }
  });

  // Create inventory item
  app.post("/api/inventory", async (req, res) => {
    try {
      const validation = insertInventoryItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }
      
      const item = await storage.createInventoryItem(validation.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  // Update inventory item
  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const validation = insertInventoryItemSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }

      const item = await storage.updateInventoryItem(id, validation.data);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  // Delete inventory item
  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const deleted = await storage.deleteInventoryItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
