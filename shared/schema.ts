import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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
  isSold: boolean("is_sold").default(false).notNull(), // مباع
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  entryDate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
