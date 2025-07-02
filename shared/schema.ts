import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // الفئة
  engineCapacity: text("engine_capacity").notNull(), // سعة المحرك
  year: integer("year").notNull(), // السنة
  exteriorColor: text("exterior_color").notNull(), // اللون الخارجي
  interiorColor: text("interior_color").notNull(), // اللون الداخلي
  status: text("status").notNull(), // الحالة
  importType: text("import_type").notNull(), // الاستيراد (شخصي/شركة/مستعمل شخصي)
  manufacturer: text("manufacturer").notNull(), // الصانع
  chassisNumber: text("chassis_number").notNull().unique(), // رقم الهيكل
  images: text("images").array().default([]), // الصور
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
