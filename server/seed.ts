import { db } from "./db";
import { inventoryItems, type InsertInventoryItem } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  const sampleItems: InsertInventoryItem[] = [
    {
      manufacturer: "مرسيدس",
      category: "E200",
      engineCapacity: "2.0L",
      year: 2025,
      exteriorColor: "أسود",
      interiorColor: "بيج",
      status: "في الطريق",
      importType: "شخصي",
      location: "الميناء",
      chassisNumber: "WDB2130461A123456",
      images: [],
      notes: "سيارة جديدة وصلت من المعرض",
      isSold: false
    },
    {
      manufacturer: "مرسيدس",
      category: "C200",
      engineCapacity: "1.5L",
      year: 2024,
      exteriorColor: "أبيض",
      interiorColor: "أسود",
      status: "متوفر",
      importType: "شركة",
      location: "المستودع الرئيسي",
      chassisNumber: "WDB2040461A789012",
      images: ["https://example.com/mercedes-c200.jpg"],
      notes: "للشركة الرئيسية",
      isSold: false
    },
    {
      manufacturer: "مرسيدس",
      category: "C300",
      engineCapacity: "2.0L",
      year: 2025,
      exteriorColor: "فضي",
      interiorColor: "أحمر",
      status: "متوفر",
      importType: "مستعمل شخصي",
      location: "المعرض",
      chassisNumber: "WDB2040461A345678",
      images: [],
      notes: "حالة ممتازة",
      isSold: true
    },
    {
      manufacturer: "بي ام دبليو",
      category: "X5",
      engineCapacity: "3.0L",
      year: 2024,
      exteriorColor: "أسود",
      interiorColor: "رمادي",
      status: "قيد الصيانة",
      importType: "شخصي",
      location: "الورشة",
      chassisNumber: "WBAFR9C50KC123456",
      images: [],
      notes: "تحتاج صيانة دورية",
      isSold: false
    },
    {
      manufacturer: "بي ام دبليو",
      category: "X3",
      engineCapacity: "2.0L",
      year: 2025,
      exteriorColor: "أبيض",
      interiorColor: "أسود",
      status: "متوفر",
      importType: "شركة",
      location: "المعرض",
      chassisNumber: "WBAXH9C50KC789012",
      images: ["https://example.com/bmw-x3.jpg"],
      notes: "موديل حديث",
      isSold: false
    },
    {
      manufacturer: "اودي",
      category: "A4",
      engineCapacity: "2.0L",
      year: 2024,
      exteriorColor: "أزرق",
      interiorColor: "بيج",
      status: "متوفر",
      importType: "شخصي",
      location: "المستودع الرئيسي",
      chassisNumber: "WAUZZZ8K7DA345678",
      images: [],
      notes: "حالة ممتازة",
      isSold: false
    },
    {
      manufacturer: "اودي",
      category: "Q5",
      engineCapacity: "2.0L",
      year: 2025,
      exteriorColor: "رمادي",
      interiorColor: "أسود",
      status: "في الطريق",
      importType: "شركة",
      location: "الميناء",
      chassisNumber: "WAUZZZ8R7JA901234",
      images: ["https://example.com/audi-q5.jpg"],
      notes: "وصول متوقع الأسبوع القادم",
      isSold: false
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