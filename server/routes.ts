import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventoryItemSchema, insertManufacturerSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return user data without password
      res.json({
        username: user.username,
        role: user.role,
        id: user.id
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

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
      const { category, status, year, manufacturer, importType, location } = req.query;
      const filters: { 
        category?: string; 
        status?: string; 
        year?: number; 
        manufacturer?: string;
        importType?: string;
        location?: string;
      } = {};
      
      if (category) filters.category = category as string;
      if (status) filters.status = status as string;
      if (year) filters.year = parseInt(year as string);
      if (manufacturer) filters.manufacturer = manufacturer as string;
      if (importType) filters.importType = importType as string;
      if (location) filters.location = location as string;
      
      const items = await storage.filterInventoryItems(filters);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter inventory items" });
    }
  });

  // Get manufacturer statistics
  app.get("/api/inventory/manufacturer-stats", async (req, res) => {
    try {
      const stats = await storage.getManufacturerStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch manufacturer stats" });
    }
  });

  // Get location statistics
  app.get("/api/inventory/location-stats", async (req, res) => {
    try {
      const stats = await storage.getLocationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location stats" });
    }
  });

  // Transfer item to different location
  app.patch("/api/inventory/:id/transfer", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { location } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }
      
      const success = await storage.transferItem(id, location);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Item transferred successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to transfer item" });
    }
  });

  // Mark item as sold
  app.post("/api/inventory/:id/sell", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const success = await storage.markAsSold(id);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Item marked as sold successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark item as sold" });
    }
  });

  // Create inventory item
  app.post("/api/inventory", async (req, res) => {
    try {
      console.log("Received data:", req.body);
      const validation = insertInventoryItemSchema.safeParse(req.body);
      if (!validation.success) {
        console.log("Validation errors:", validation.error.errors);
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }
      
      const item = await storage.createInventoryItem(validation.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create inventory item error:", error);
      res.status(500).json({ message: "Failed to create inventory item", error: error.message });
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

  // Sell inventory item (mark as sold with current date)
  app.put("/api/inventory/:id/sell", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const item = await storage.updateInventoryItem(id, {
        status: "مباع",
        isSold: true,
        soldDate: new Date()
      });
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error selling inventory item:", error);
      res.status(500).json({ message: "Failed to sell inventory item" });
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

  // Manufacturers endpoints
  app.get("/api/manufacturers", async (req, res) => {
    try {
      const manufacturers = await storage.getAllManufacturers();
      res.json(manufacturers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch manufacturers" });
    }
  });

  app.post("/api/manufacturers", async (req, res) => {
    try {
      const manufacturerData = insertManufacturerSchema.parse(req.body);
      const manufacturer = await storage.createManufacturer(manufacturerData);
      res.status(201).json(manufacturer);
    } catch (error) {
      res.status(400).json({ message: "Invalid manufacturer data" });
    }
  });

  app.put("/api/manufacturers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const manufacturerData = insertManufacturerSchema.parse(req.body);
      const manufacturer = await storage.updateManufacturer(id, manufacturerData);
      if (manufacturer) {
        res.json(manufacturer);
      } else {
        res.status(404).json({ message: "Manufacturer not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid manufacturer data" });
    }
  });

  // Appearance settings routes
  app.get("/api/appearance", async (req, res) => {
    try {
      const settings = await storage.getAppearanceSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching appearance settings:", error);
      res.status(500).json({ message: "Failed to fetch appearance settings" });
    }
  });

  app.put("/api/appearance", async (req, res) => {
    try {
      const settings = await storage.updateAppearanceSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating appearance settings:", error);
      res.status(500).json({ message: "Failed to update appearance settings" });
    }
  });

  app.put("/api/manufacturers/:id/logo", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { logo } = req.body;
      
      if (!logo) {
        return res.status(400).json({ message: "Logo data is required" });
      }

      const manufacturer = await storage.updateManufacturerLogo(id, logo);
      if (manufacturer) {
        res.json(manufacturer);
      } else {
        res.status(404).json({ message: "Manufacturer not found" });
      }
    } catch (error) {
      console.error("Error updating manufacturer logo:", error);
      res.status(500).json({ message: "Failed to update manufacturer logo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
