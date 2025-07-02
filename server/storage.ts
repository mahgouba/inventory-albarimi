import { users, inventoryItems, type User, type InsertUser, type InventoryItem, type InsertInventoryItem } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inventory methods
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  searchInventoryItems(query: string): Promise<InventoryItem[]>;
  filterInventoryItems(filters: { 
    category?: string; 
    status?: string; 
    year?: number; 
    manufacturer?: string;
    importType?: string;
    location?: string;
  }): Promise<InventoryItem[]>;
  getInventoryStats(): Promise<{ 
    total: number; 
    available: number; 
    inTransit: number; 
    maintenance: number;
    sold: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }>;
  getManufacturerStats(): Promise<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }>>;
  getLocationStats(): Promise<Array<{
    location: string;
    total: number;
    available: number;
    inTransit: number;
    maintenance: number;
    sold: number;
  }>>;
  transferItem(id: number, newLocation: string): Promise<boolean>;
  markAsSold(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventoryItems: Map<number, InventoryItem>;
  private currentUserId: number;
  private currentInventoryId: number;

  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.currentUserId = 1;
    this.currentInventoryId = 1;
    
    // Initialize with some sample data
    this.initializeInventoryData();
  }

  private initializeInventoryData() {
    const sampleItems: InsertInventoryItem[] = [
      {
        category: "لاتوبيغرافي",
        engineCapacity: "V6",
        year: 2025,
        exteriorColor: "أسود",
        interiorColor: "أبيض",
        status: "في الطريق",
        importType: "شخصي",
        manufacturer: "مرسيدس",
        location: "الميناء",
        chassisNumber: "WASSBER0056464",
        images: []
      },
      {
        category: "لاتوبيغرافي",
        engineCapacity: "V6",
        year: 2024,
        exteriorColor: "أسود",
        interiorColor: "أبيض",
        status: "في الطريق",
        importType: "شركة",
        manufacturer: "لاند روفر",
        location: "المعرض",
        chassisNumber: "WASSBER0056465",
        images: []
      },
      {
        category: "لاتوبيغرافي",
        engineCapacity: "V8",
        year: 2025,
        exteriorColor: "أسود",
        interiorColor: "أبيض",
        status: "متوفر",
        importType: "مستعمل شخصي",
        manufacturer: "مرسيدس",
        location: "الورشة",
        chassisNumber: "WASSBER0056466",
        images: []
      },
      {
        category: "أوتوماتيكي",
        engineCapacity: "V6",
        year: 2024,
        exteriorColor: "أسود",
        interiorColor: "رمادي",
        status: "قيد الصيانة",
        importType: "شخصي",
        manufacturer: "لاند روفر",
        location: "مستودع فرعي",
        chassisNumber: "WASSBER0087523",
        images: []
      },
      {
        category: "يدوي",
        engineCapacity: "V8",
        year: 2025,
        exteriorColor: "أبيض",
        interiorColor: "أسود",
        status: "متوفر",
        importType: "شركة",
        manufacturer: "مرسيدس",
        location: "المستودع الرئيسي",
        chassisNumber: "WASSBER0098765",
        images: []
      }
    ];

    sampleItems.forEach(item => {
      this.createInventoryItem(item);
    });
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.currentInventoryId++;
    const item: InventoryItem = { 
      ...insertItem, 
      id, 
      entryDate: new Date(),
      isSold: insertItem.isSold || false,
      images: insertItem.images || [],
      notes: insertItem.notes || null
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem: InventoryItem = { ...existingItem, ...updateData };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.inventoryItems.values()).filter(item =>
      item.category.toLowerCase().includes(lowerQuery) ||
      item.engineCapacity.toLowerCase().includes(lowerQuery) ||
      item.exteriorColor.toLowerCase().includes(lowerQuery) ||
      item.interiorColor.toLowerCase().includes(lowerQuery) ||
      item.status.toLowerCase().includes(lowerQuery) ||
      item.importType.toLowerCase().includes(lowerQuery) ||
      item.manufacturer.toLowerCase().includes(lowerQuery) ||
      item.chassisNumber.toLowerCase().includes(lowerQuery)
    );
  }

  async filterInventoryItems(filters: { 
    category?: string; 
    status?: string; 
    year?: number; 
    manufacturer?: string;
    importType?: string;
  }): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.year && item.year !== filters.year) return false;
      if (filters.manufacturer && item.manufacturer !== filters.manufacturer) return false;
      if (filters.importType && item.importType !== filters.importType) return false;
      return true;
    });
  }

  async getInventoryStats(): Promise<{ 
    total: number; 
    available: number; 
    inTransit: number; 
    maintenance: number;
    sold: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }> {
    const items = Array.from(this.inventoryItems.values());
    return {
      total: items.length,
      available: items.filter(item => item.status === "متوفر").length,
      inTransit: items.filter(item => item.status === "في الطريق").length,
      maintenance: items.filter(item => item.status === "قيد الصيانة").length,
      sold: items.filter(item => item.isSold).length,
      personal: items.filter(item => item.importType === "شخصي").length,
      company: items.filter(item => item.importType === "شركة").length,
      usedPersonal: items.filter(item => item.importType === "مستعمل شخصي").length,
    };
  }

  async getManufacturerStats(): Promise<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }>> {
    const items = Array.from(this.inventoryItems.values());
    const manufacturerSet = new Set(items.map(item => item.manufacturer));
    const manufacturers = Array.from(manufacturerSet);
    
    return manufacturers.map(manufacturer => {
      const manufacturerItems = items.filter(item => item.manufacturer === manufacturer);
      return {
        manufacturer,
        total: manufacturerItems.length,
        personal: manufacturerItems.filter(item => item.importType === "شخصي").length,
        company: manufacturerItems.filter(item => item.importType === "شركة").length,
        usedPersonal: manufacturerItems.filter(item => item.importType === "مستعمل شخصي").length,
      };
    });
  }

  async markAsSold(id: number): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    const updatedItem = { ...item, isSold: true };
    this.inventoryItems.set(id, updatedItem);
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db
      .update(inventoryItems)
      .set(updateData)
      .where(eq(inventoryItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const items = await db.select().from(inventoryItems);
    return items.filter(item =>
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.engineCapacity.toLowerCase().includes(query.toLowerCase()) ||
      item.exteriorColor.toLowerCase().includes(query.toLowerCase()) ||
      item.interiorColor.toLowerCase().includes(query.toLowerCase()) ||
      item.status.toLowerCase().includes(query.toLowerCase()) ||
      item.importType.toLowerCase().includes(query.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(query.toLowerCase()) ||
      item.chassisNumber.toLowerCase().includes(query.toLowerCase())
    );
  }

  async filterInventoryItems(filters: { 
    category?: string; 
    status?: string; 
    year?: number; 
    manufacturer?: string;
    importType?: string;
  }): Promise<InventoryItem[]> {
    const items = await db.select().from(inventoryItems);
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.year && item.year !== filters.year) return false;
      if (filters.manufacturer && item.manufacturer !== filters.manufacturer) return false;
      if (filters.importType && item.importType !== filters.importType) return false;
      return true;
    });
  }

  async getInventoryStats(): Promise<{ 
    total: number; 
    available: number; 
    inTransit: number; 
    maintenance: number;
    sold: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }> {
    const items = await db.select().from(inventoryItems);
    return {
      total: items.length,
      available: items.filter(item => item.status === "متوفر").length,
      inTransit: items.filter(item => item.status === "في الطريق").length,
      maintenance: items.filter(item => item.status === "قيد الصيانة").length,
      sold: items.filter(item => item.isSold).length,
      personal: items.filter(item => item.importType === "شخصي").length,
      company: items.filter(item => item.importType === "شركة").length,
      usedPersonal: items.filter(item => item.importType === "مستعمل شخصي").length,
    };
  }

  async getManufacturerStats(): Promise<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }>> {
    const items = await db.select().from(inventoryItems);
    const manufacturerSet = new Set(items.map(item => item.manufacturer));
    const manufacturers = Array.from(manufacturerSet);
    
    return manufacturers.map(manufacturer => {
      const manufacturerItems = items.filter(item => item.manufacturer === manufacturer);
      return {
        manufacturer,
        total: manufacturerItems.length,
        personal: manufacturerItems.filter(item => item.importType === "شخصي").length,
        company: manufacturerItems.filter(item => item.importType === "شركة").length,
        usedPersonal: manufacturerItems.filter(item => item.importType === "مستعمل شخصي").length,
      };
    });
  }

  async getLocationStats(): Promise<Array<{
    location: string;
    total: number;
    available: number;
    inTransit: number;
    maintenance: number;
    sold: number;
  }>> {
    const items = await db.select().from(inventoryItems);
    const locationMap = new Map<string, {
      total: number;
      available: number;
      inTransit: number;
      maintenance: number;
      sold: number;
    }>();

    items.forEach(item => {
      if (!locationMap.has(item.location)) {
        locationMap.set(item.location, {
          total: 0,
          available: 0,
          inTransit: 0,
          maintenance: 0,
          sold: 0
        });
      }
      
      const stats = locationMap.get(item.location)!;
      stats.total++;
      
      if (item.isSold) {
        stats.sold++;
      } else if (item.status === "متوفر") {
        stats.available++;
      } else if (item.status === "في الطريق") {
        stats.inTransit++;
      } else if (item.status === "قيد الصيانة") {
        stats.maintenance++;
      }
    });

    return Array.from(locationMap.entries()).map(([location, stats]) => ({
      location,
      ...stats
    }));
  }

  async transferItem(id: number, newLocation: string): Promise<boolean> {
    const result = await db
      .update(inventoryItems)
      .set({ location: newLocation })
      .where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async markAsSold(id: number): Promise<boolean> {
    const result = await db
      .update(inventoryItems)
      .set({ isSold: true })
      .where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
