import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertInventoryItemSchema, 
  insertManufacturerSchema,
  insertLocationSchema,
  insertLocationTransferSchema,
  insertUserSchema 
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Voice command processing functions
async function processVoiceCommand(command: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `أنت مساعد ذكي لإدارة مخزون المركبات. قم بتحليل الأوامر الصوتية وإرجاع استجابة JSON تحتوي على:
- intent: نوع الطلب (add_vehicle, search_vehicle, sell_vehicle, delete_vehicle, extract_chassis, get_stats, reserve_vehicle, cancel_reservation, edit_vehicle)
- entities: البيانات المستخرجة من الأمر
- confidence: مستوى الثقة (0-1)
- action: الإجراء المطلوب
- content: الرد النصي للمستخدم

أمثلة الأوامر:
- "أضف مركبة مرسيدس C200 موديل 2023" → add_vehicle مع entities: {manufacturer: "مرسيدس", category: "C200", year: 2023}
- "ابحث عن مرسيدس" → search_vehicle مع entities: {searchTerm: "مرسيدس"}
- "بع المركبة رقم 50" → sell_vehicle مع entities: {vehicleId: 50}
- "احذف المركبة رقم XYZ789" → delete_vehicle مع entities: {chassisNumber: "XYZ789"}
- "احجز المركبة رقم 50" → reserve_vehicle مع entities: {vehicleId: 50}
- "ألغي حجز المركبة رقم 50" → cancel_reservation مع entities: {vehicleId: 50}
- "عدل المركبة رقم 50" → edit_vehicle مع entities: {vehicleId: 50}
- "استخرج رقم الهيكل من الصورة" → extract_chassis
- "أعطني إحصائيات المخزون" → get_stats`
        },
        {
          role: "user",
          content: command
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Execute the action based on intent
    const actionResult = await executeVoiceAction(result.intent, result.entities);
    
    return {
      intent: result.intent || "unknown",
      entities: result.entities || {},
      confidence: result.confidence || 0.5,
      action: result.action || result.intent,
      content: actionResult.content || result.content || "تم معالجة طلبك.",
      success: actionResult.success !== undefined ? actionResult.success : true
    };
  } catch (error) {
    console.error("Error processing voice command:", error);
    return {
      intent: "error",
      entities: {},
      confidence: 0,
      action: "error",
      content: "عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى."
    };
  }
}

// Execute database actions based on voice commands
async function executeVoiceAction(intent: string, entities: any) {
  try {
    switch (intent) {
      case "add_vehicle":
        return await handleAddVehicle(entities);
      
      case "search_vehicle":
        return await handleSearchVehicle(entities);
      
      case "sell_vehicle":
        return await handleSellVehicle(entities);
      
      case "delete_vehicle":
        return await handleDeleteVehicle(entities);
      
      case "reserve_vehicle":
        return await handleReserveVehicle(entities);
      
      case "cancel_reservation":
        return await handleCancelReservation(entities);
      
      case "edit_vehicle":
        return await handleEditVehicle(entities);
      
      case "get_stats":
        return await handleGetStats();
      
      default:
        return {
          success: false,
          content: "لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى."
        };
    }
  } catch (error) {
    console.error("Error executing voice action:", error);
    return {
      success: false,
      content: "حدث خطأ أثناء تنفيذ العملية."
    };
  }
}

// Action handlers
async function handleAddVehicle(entities: any) {
  const { manufacturer, category, engineCapacity, year, exteriorColor, interiorColor, status, importType, location, chassisNumber, price, notes } = entities;
  
  if (!manufacturer || !category) {
    return {
      success: false,
      content: "يرجى تحديد الصانع والفئة على الأقل لإضافة المركبة."
    };
  }
  
  try {
    const newVehicle = await storage.createInventoryItem({
      manufacturer,
      category,
      engineCapacity: engineCapacity || "غير محدد",
      year: year || new Date().getFullYear(),
      exteriorColor: exteriorColor || "غير محدد",
      interiorColor: interiorColor || "غير محدد",
      status: status || "متوفر",
      importType: importType || "شخصي",
      location: location || "المعرض الرئيسي",
      chassisNumber: chassisNumber || "",
      price: price || null,
      notes: notes || null,
      images: []
    });
    
    return {
      success: true,
      content: `تمت إضافة المركبة بنجاح. ${manufacturer} ${category} برقم ${newVehicle.id}`
    };
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء إضافة المركبة."
    };
  }
}

async function handleSearchVehicle(entities: any) {
  const { searchTerm } = entities;
  
  if (!searchTerm) {
    return {
      success: false,
      content: "يرجى تحديد ما تريد البحث عنه."
    };
  }
  
  try {
    const results = await storage.searchInventoryItems(searchTerm);
    
    if (results.length === 0) {
      return {
        success: true,
        content: `لم أجد أي مركبات تطابق "${searchTerm}"`
      };
    }
    
    const resultText = results.slice(0, 5).map(item => 
      `رقم ${item.id}: ${item.manufacturer} ${item.category} - ${item.status}`
    ).join(", ");
    
    return {
      success: true,
      content: `وجدت ${results.length} مركبة. أول 5 نتائج: ${resultText}`
    };
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء البحث."
    };
  }
}

async function handleSellVehicle(entities: any) {
  const { vehicleId, chassisNumber } = entities;
  
  let vehicle;
  
  try {
    if (vehicleId) {
      vehicle = await storage.getInventoryItem(vehicleId);
    } else if (chassisNumber) {
      const allVehicles = await storage.getAllInventoryItems();
      vehicle = allVehicles.find(v => v.chassisNumber === chassisNumber);
    }
    
    if (!vehicle) {
      return {
        success: false,
        content: "لم أجد المركبة المحددة."
      };
    }
    
    if (vehicle.isSold) {
      return {
        success: false,
        content: "هذه المركبة مباعة مسبقاً."
      };
    }
    
    const success = await storage.markAsSold(vehicle.id);
    
    if (success) {
      return {
        success: true,
        content: `تم بيع المركبة بنجاح. ${vehicle.manufacturer} ${vehicle.category} رقم ${vehicle.id}`
      };
    } else {
      return {
        success: false,
        content: "حدث خطأ أثناء بيع المركبة."
      };
    }
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء بيع المركبة."
    };
  }
}

async function handleDeleteVehicle(entities: any) {
  const { vehicleId, chassisNumber } = entities;
  
  let vehicle;
  
  try {
    if (vehicleId) {
      vehicle = await storage.getInventoryItem(vehicleId);
    } else if (chassisNumber) {
      const allVehicles = await storage.getAllInventoryItems();
      vehicle = allVehicles.find(v => v.chassisNumber === chassisNumber);
    }
    
    if (!vehicle) {
      return {
        success: false,
        content: "لم أجد المركبة المحددة."
      };
    }
    
    const success = await storage.deleteInventoryItem(vehicle.id);
    
    if (success) {
      return {
        success: true,
        content: `تم حذف المركبة بنجاح. ${vehicle.manufacturer} ${vehicle.category} رقم ${vehicle.id}`
      };
    } else {
      return {
        success: false,
        content: "حدث خطأ أثناء حذف المركبة."
      };
    }
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء حذف المركبة."
    };
  }
}

async function handleReserveVehicle(entities: any) {
  const { vehicleId } = entities;
  
  if (!vehicleId) {
    return {
      success: false,
      content: "يرجى تحديد رقم المركبة للحجز."
    };
  }
  
  try {
    const vehicle = await storage.getInventoryItem(vehicleId);
    
    if (!vehicle) {
      return {
        success: false,
        content: "لم أجد المركبة المحددة."
      };
    }
    
    if (vehicle.isSold) {
      return {
        success: false,
        content: "لا يمكن حجز مركبة مباعة."
      };
    }
    
    if (vehicle.status === "محجوز") {
      return {
        success: false,
        content: "هذه المركبة محجوزة مسبقاً."
      };
    }
    
    const success = await storage.reserveItem(vehicleId, "المساعد الصوتي", "تم الحجز عبر المساعد الصوتي");
    
    if (success) {
      return {
        success: true,
        content: `تم حجز المركبة بنجاح. ${vehicle.manufacturer} ${vehicle.category} رقم ${vehicle.id}`
      };
    } else {
      return {
        success: false,
        content: "حدث خطأ أثناء حجز المركبة."
      };
    }
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء حجز المركبة."
    };
  }
}

async function handleCancelReservation(entities: any) {
  const { vehicleId } = entities;
  
  if (!vehicleId) {
    return {
      success: false,
      content: "يرجى تحديد رقم المركبة لإلغاء الحجز."
    };
  }
  
  try {
    const vehicle = await storage.getInventoryItem(vehicleId);
    
    if (!vehicle) {
      return {
        success: false,
        content: "لم أجد المركبة المحددة."
      };
    }
    
    if (vehicle.status !== "محجوز") {
      return {
        success: false,
        content: "هذه المركبة غير محجوزة."
      };
    }
    
    const success = await storage.cancelReservation(vehicleId);
    
    if (success) {
      return {
        success: true,
        content: `تم إلغاء حجز المركبة بنجاح. ${vehicle.manufacturer} ${vehicle.category} رقم ${vehicle.id}`
      };
    } else {
      return {
        success: false,
        content: "حدث خطأ أثناء إلغاء حجز المركبة."
      };
    }
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء إلغاء حجز المركبة."
    };
  }
}

async function handleEditVehicle(entities: any) {
  const { vehicleId } = entities;
  
  if (!vehicleId) {
    return {
      success: false,
      content: "يرجى تحديد رقم المركبة للتعديل."
    };
  }
  
  try {
    const vehicle = await storage.getInventoryItem(vehicleId);
    
    if (!vehicle) {
      return {
        success: false,
        content: "لم أجد المركبة المحددة."
      };
    }
    
    return {
      success: true,
      content: `المركبة رقم ${vehicleId} موجودة: ${vehicle.manufacturer} ${vehicle.category}. يرجى استخدام نموذج التعديل في الواجهة لتحديث البيانات.`
    };
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء البحث عن المركبة."
    };
  }
}

async function handleGetStats() {
  try {
    const stats = await storage.getInventoryStats();
    const manufacturerStats = await storage.getManufacturerStats();
    
    const topManufacturers = manufacturerStats.slice(0, 3).map(m => 
      `${m.manufacturer}: ${m.total} مركبة`
    ).join(", ");
    
    return {
      success: true,
      content: `إحصائيات المخزون: إجمالي ${stats.total} مركبة، متوفر ${stats.available}، محجوز ${stats.reserved}، في الطريق ${stats.inTransit}، قيد الصيانة ${stats.maintenance}. أكثر الصانعين: ${topManufacturers}`
    };
  } catch (error) {
    return {
      success: false,
      content: "حدث خطأ أثناء جلب الإحصائيات."
    };
  }
}

async function extractChassisNumberFromImage(imageData: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "استخرج رقم الهيكل من هذه الصورة. رقم الهيكل عادة ما يكون مكون من أرقام وحروف إنجليزية. يرجى إرجاع رقم الهيكل فقط بدون أي نص إضافي. إذا لم تجد رقم هيكل واضح، أرجع كلمة 'غير موجود'."
            },
            {
              type: "image_url",
              image_url: {
                url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`
              }
            }
          ]
        }
      ],
      max_tokens: 100
    });

    const extractedText = response.choices[0]?.message?.content?.trim() || "";
    
    let chassisNumber = "";
    if (extractedText && extractedText !== "غير موجود" && extractedText.length > 5) {
      chassisNumber = extractedText.replace(/[^A-Za-z0-9\-]/g, "").toUpperCase();
    }

    return {
      chassisNumber: chassisNumber || null,
      rawText: extractedText
    };
  } catch (error) {
    console.error("Error extracting chassis number:", error);
    return {
      chassisNumber: null,
      rawText: "",
      error: "Failed to process image"
    };
  }
}

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

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        role
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
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

  // Reserve item
  app.post("/api/inventory/:id/reserve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reservedBy, reservationNote } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      if (!reservedBy) {
        return res.status(400).json({ message: "Reserved by is required" });
      }
      
      const success = await storage.reserveItem(id, reservedBy, reservationNote);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Item reserved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reserve item" });
    }
  });

  // Cancel reservation
  app.post("/api/inventory/:id/cancel-reservation", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const success = await storage.cancelReservation(id);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Reservation cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel reservation" });
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
    } catch (error: any) {
      console.error("Create inventory item error:", error);
      
      // Check if it's a duplicate chassis number error
      if (error.code === '23505' && error.constraint === 'inventory_items_chassis_number_unique') {
        return res.status(400).json({ 
          message: "رقم الهيكل موجود مسبقاً",
          error: "DUPLICATE_CHASSIS_NUMBER"
        });
      }
      
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
      console.log("Received manufacturer data:", req.body);
      const manufacturerData = insertManufacturerSchema.parse(req.body);
      console.log("Parsed manufacturer data:", manufacturerData);
      
      // Check if manufacturer already exists
      const existingManufacturers = await storage.getAllManufacturers();
      const existingManufacturer = existingManufacturers.find(
        m => m.name.toLowerCase() === manufacturerData.name.toLowerCase()
      );
      
      if (existingManufacturer) {
        return res.status(409).json({ 
          message: "Manufacturer already exists",
          error: "duplicate_name"
        });
      }
      
      const manufacturer = await storage.createManufacturer(manufacturerData);
      res.status(201).json(manufacturer);
    } catch (error) {
      console.error("Error creating manufacturer:", error);
      
      // Check if it's a duplicate key error
      if ((error as any).code === '23505' && (error as any).constraint === 'manufacturers_name_unique') {
        return res.status(409).json({ 
          message: "Manufacturer already exists",
          error: "duplicate_name"
        });
      }
      
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

  // Location endpoints
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  app.put("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const locationData = req.body;
      const location = await storage.updateLocation(id, locationData);
      if (location) {
        res.json(location);
      } else {
        res.status(404).json({ message: "Location not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLocation(id);
      if (success) {
        res.json({ message: "Location deleted successfully" });
      } else {
        res.status(404).json({ message: "Location not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Location transfer endpoints
  app.get("/api/location-transfers", async (req, res) => {
    try {
      const transfers = await storage.getLocationTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location transfers" });
    }
  });

  app.post("/api/location-transfers", async (req, res) => {
    try {
      const transferData = insertLocationTransferSchema.parse(req.body);
      const transfer = await storage.createLocationTransfer(transferData);
      res.status(201).json(transfer);
    } catch (error) {
      res.status(400).json({ message: "Invalid transfer data" });
    }
  });

  // Transfer item to new location endpoint
  app.post("/api/inventory/:id/transfer", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { newLocation, reason, transferredBy } = req.body;
      
      if (!newLocation) {
        return res.status(400).json({ message: "New location is required" });
      }

      const success = await storage.transferItem(id, newLocation, reason, transferredBy);
      if (success) {
        res.json({ message: "Item transferred successfully" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to transfer item" });
    }
  });

  // Extract chassis number from image using OpenAI Vision API
  app.post("/api/extract-chassis-number", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      // Call OpenAI Vision API to extract text from image
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "استخرج رقم الهيكل من هذه الصورة. رقم الهيكل عادة ما يكون مكون من أرقام وحروف إنجليزية. يرجى إرجاع رقم الهيكل فقط بدون أي نص إضافي. إذا لم تجد رقم هيكل واضح، أرجع كلمة 'غير موجود'."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 100
      });

      const extractedText = response.choices[0]?.message?.content?.trim() || "";
      
      // Clean up the extracted text and validate it looks like a chassis number
      let chassisNumber = "";
      if (extractedText && extractedText !== "غير موجود" && extractedText.length > 5) {
        // Remove any non-alphanumeric characters except common chassis number separators
        chassisNumber = extractedText.replace(/[^A-Za-z0-9\-]/g, "").toUpperCase();
      }

      res.json({ 
        chassisNumber: chassisNumber || "",
        rawText: extractedText
      });

    } catch (error) {
      console.error("Error extracting chassis number:", error);
      res.status(500).json({ message: "Failed to extract chassis number from image" });
    }
  });

  // Voice Assistant Routes
  app.post("/api/voice/process", async (req, res) => {
    try {
      const { command } = req.body;
      
      if (!command) {
        return res.status(400).json({ message: "Command is required" });
      }

      const processedCommand = await processVoiceCommand(command);
      res.json(processedCommand);
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });

  app.post("/api/voice/extract-chassis", async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      const result = await extractChassisNumberFromImage(imageData);
      res.json(result);
    } catch (error) {
      console.error("Error extracting chassis number:", error);
      res.status(500).json({ message: "Failed to extract chassis number" });
    }
  });

  // Voice processing endpoint (legacy)
  app.post("/api/voice/process-legacy", async (req, res) => {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // For now, simulate voice processing - in production you'd handle file upload
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      // Process command with GPT
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `أنت مساعد ذكي لإدارة مخزون المركبات. يمكنك فهم الأوامر الصوتية باللغة العربية وتنفيذها.

الأوامر المتاحة:
1. إضافة مركبة: "أضف مركبة [الصانع] [الفئة] [الموديل]"
2. بيع مركبة: "بيع المركبة رقم [رقم الهيكل]" أو "بيع السيارة [رقم]"
3. البحث: "ابحث عن [نص البحث]" أو "أظهر مركبات [الصانع]"
4. الإحصائيات: "أظهر الإحصائيات" أو "كم مركبة متوفرة"

أرجع الرد بتنسيق JSON:
{
  "response": "الرد النصي للمستخدم باللغة العربية",
  "action": "نوع العملية (add_vehicle, sell_vehicle, search_inventory, show_stats)",
  "data": "البيانات المطلوبة للعملية"
}

إذا كان الأمر غير واضح أو غير مدعوم، أرجع action: null`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      res.json({
        transcription: text,
        response: result.response || "لم أفهم الأمر بشكل صحيح",
        action: result.action || null,
        data: result.data || null
      });

    } catch (error: any) {
      console.error("Voice processing error:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });

  // User Management APIs (Admin only)
  
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response for security
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return {
          ...safeUser,
          createdAt: new Date().toISOString() // Add created date for display
        };
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "المستخدم موجود بالفعل" });
      }

      const newUser = await storage.createUser({
        username,
        password,
        role
      });

      // Remove password from response
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const { role, password } = req.body;
      const updateData: any = {};
      
      if (role) updateData.role = role;
      if (password) updateData.password = password;

      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password: _, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
