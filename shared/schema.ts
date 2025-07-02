import { pgTable, text, serial, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("seller"), // 'admin' or 'seller'
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(), // الصانع (مرسيدس، بي ام دبليو، اودي)
  category: text("category").notNull(), // الفئة (E200, C200, C300, X5, A4)
  engineCapacity: text("engine_capacity").notNull(), // سعة المحرك
  year: integer("year").notNull(), // السنة
  exteriorColor: text("exterior_color").notNull(), // اللون الخارجي
  interiorColor: text("interior_color").notNull(), // اللون الداخلي
  status: text("status").notNull(), // الحالة
  importType: text("import_type").notNull(), // الاستيراد (شخصي/شركة/مستعمل شخصي)
  location: text("location").notNull(), // الموقع (المستودع الرئيسي، المعرض، الورشة، الميناء)
  chassisNumber: text("chassis_number").notNull().unique(), // رقم الهيكل
  images: text("images").array().default([]), // الصور
  logo: text("logo"), // اللوجو
  notes: text("notes"), // الملاحظات
  entryDate: timestamp("entry_date").defaultNow().notNull(), // تاريخ الدخول
  price: decimal("price", { precision: 10, scale: 2 }), // السعر
  isSold: boolean("is_sold").default(false).notNull(), // مباع
  soldDate: timestamp("sold_date"), // تاريخ البيع
});

// Manufacturers table for storing manufacturer logos
export const manufacturers = pgTable("manufacturers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Locations table for managing inventory locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // اسم الموقع
  description: text("description"), // الوصف
  address: text("address"), // العنوان
  manager: text("manager"), // المسؤول
  phone: text("phone"), // الهاتف
  capacity: integer("capacity"), // السعة القصوى
  isActive: boolean("is_active").default(true).notNull(), // نشط
  createdAt: timestamp("created_at").defaultNow(),
});

// Location transfers table for tracking item movements
export const locationTransfers = pgTable("location_transfers", {
  id: serial("id").primaryKey(),
  inventoryItemId: integer("inventory_item_id").notNull(),
  fromLocation: text("from_location").notNull(), // الموقع السابق
  toLocation: text("to_location").notNull(), // الموقع الجديد
  transferDate: timestamp("transfer_date").defaultNow().notNull(), // تاريخ النقل
  reason: text("reason"), // السبب
  transferredBy: text("transferred_by"), // المنقول بواسطة
  notes: text("notes"), // ملاحظات
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  entryDate: true,
});

export const insertManufacturerSchema = createInsertSchema(manufacturers).omit({
  id: true,
  createdAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertLocationTransferSchema = createInsertSchema(locationTransfers).omit({
  id: true,
  transferDate: true,
});

// User sessions table for tracking login/logout times
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  loginTime: timestamp("login_time").defaultNow().notNull(),
  logoutTime: timestamp("logout_time"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Activity logs table for tracking user actions
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // 'add', 'edit', 'delete', 'sell'
  entityType: text("entity_type").notNull(), // 'inventory', 'user', 'manufacturer'
  entityId: integer("entity_id"),
  details: text("details"), // JSON string with action details
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  loginTime: true,
  isActive: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertManufacturer = z.infer<typeof insertManufacturerSchema>;
export type Manufacturer = typeof manufacturers.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocationTransfer = z.infer<typeof insertLocationTransferSchema>;
export type LocationTransfer = typeof locationTransfers.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Low stock alerts table
export const lowStockAlerts = pgTable("low_stock_alerts", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(),
  category: text("category").notNull(),
  currentStock: integer("current_stock").notNull(),
  minStockLevel: integer("min_stock_level").default(5).notNull(),
  alertLevel: text("alert_level").notNull(), // "low", "critical", "out_of_stock"
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stock level settings table
export const stockSettings = pgTable("stock_settings", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(),
  category: text("category").notNull(),
  minStockLevel: integer("min_stock_level").default(5).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(3).notNull(),
  criticalStockThreshold: integer("critical_stock_threshold").default(1).notNull(),
  autoReorderEnabled: boolean("auto_reorder_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLowStockAlertSchema = createInsertSchema(lowStockAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockSettingsSchema = createInsertSchema(stockSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LowStockAlert = typeof lowStockAlerts.$inferSelect;
export type InsertLowStockAlert = z.infer<typeof insertLowStockAlertSchema>;

export type StockSettings = typeof stockSettings.$inferSelect;
export type InsertStockSettings = z.infer<typeof insertStockSettingsSchema>;
