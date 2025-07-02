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
