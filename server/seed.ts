import { db } from "./db";
import { inventoryItems, type InsertInventoryItem } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
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
      chassisNumber: "WASSBER0098765",
      images: []
    }
  ];

  try {
    // Check if data already exists
    const existingItems = await db.select().from(inventoryItems);
    
    if (existingItems.length === 0) {
      await db.insert(inventoryItems).values(sampleItems);
      console.log("Database seeded with sample inventory items.");
    } else {
      console.log("Database already contains data, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();