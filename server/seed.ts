import { db } from "./db";
import { inventoryItems, users, manufacturers, type InsertInventoryItem } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  console.log("Seeding database...");
  
  const sampleItems: InsertInventoryItem[] = [
    // Mercedes-Benz
    {
      manufacturer: "مرسيدس",
      category: "S-Class",
      engineCapacity: "3.0L V6",
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
      category: "E-Class",
      engineCapacity: "2.0L",
      year: 2024,
      exteriorColor: "أبيض",
      interiorColor: "أسود",
      status: "متوفر",
      importType: "شركة",
      location: "المستودع الرئيسي",
      chassisNumber: "WDB2040461A789012",
      images: [],
      notes: "للشركة الرئيسية",
      isSold: false
    },
    {
      manufacturer: "مرسيدس",
      category: "C-Class",
      engineCapacity: "2.0L",
      year: 2025,
      exteriorColor: "فضي",
      interiorColor: "أحمر",
      status: "محجوز",
      importType: "مستعمل شخصي",
      location: "المعرض",
      chassisNumber: "WDB2040461A345678",
      images: [],
      notes: "حالة ممتازة - محجوز لعميل VIP",
      isSold: false
    },
    {
      manufacturer: "مرسيدس",
      category: "GLE",
      engineCapacity: "3.0L V6",
      year: 2024,
      exteriorColor: "أسود",
      interiorColor: "بني",
      status: "متوفر",
      importType: "شخصي",
      location: "المعرض",
      chassisNumber: "WDB1670461A456789",
      images: [],
      notes: "SUV فاخر",
      isSold: false
    },
    
    // BMW
    {
      manufacturer: "بي ام دبليو",
      category: "X7",
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
      category: "X5",
      engineCapacity: "2.0L",
      year: 2025,
      exteriorColor: "أبيض",
      interiorColor: "أسود",
      status: "متوفر",
      importType: "شركة",
      location: "المعرض",
      chassisNumber: "WBAXH9C50KC789012",
      images: [],
      notes: "موديل حديث",
      isSold: false
    },
    {
      manufacturer: "بي ام دبليو",
      category: "7 Series",
      engineCapacity: "3.0L V6",
      year: 2024,
      exteriorColor: "أزرق",
      interiorColor: "بيج",
      status: "متوفر",
      importType: "شخصي",
      location: "المستودع الرئيسي",
      chassisNumber: "WBANG9C50KC567890",
      images: [],
      notes: "سيدان فاخر",
      isSold: false
    },
    
    // Audi
    {
      manufacturer: "اودي",
      category: "Q8",
      engineCapacity: "3.0L V6",
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
      category: "A8",
      engineCapacity: "3.0L V6",
      year: 2025,
      exteriorColor: "رمادي",
      interiorColor: "أسود",
      status: "في الطريق",
      importType: "شركة",
      location: "الميناء",
      chassisNumber: "WAUZZZ8R7JA901234",
      images: [],
      notes: "وصول متوقع الأسبوع القادم",
      isSold: false
    },
    
    // Toyota
    {
      manufacturer: "تويوتا",
      category: "لاند كروزر",
      engineCapacity: "4.0L V6",
      year: 2024,
      exteriorColor: "أبيض",
      interiorColor: "رمادي",
      status: "متوفر",
      importType: "شخصي",
      location: "المعرض",
      chassisNumber: "JTMZK3AV1PJ123456",
      images: [],
      notes: "سيارة عائلية ممتازة",
      isSold: false
    },
    {
      manufacturer: "تويوتا",
      category: "كامري",
      engineCapacity: "2.5L",
      year: 2025,
      exteriorColor: "فضي",
      interiorColor: "أسود",
      status: "متوفر",
      importType: "شركة",
      location: "المستودع الرئيسي",
      chassisNumber: "4T1BZ1FK8NU234567",
      images: [],
      notes: "سيدان اقتصادي",
      isSold: false
    },
    
    // Lexus
    {
      manufacturer: "لكزس",
      category: "LX 600",
      engineCapacity: "3.5L V6",
      year: 2024,
      exteriorColor: "أسود",
      interiorColor: "بني",
      status: "محجوز",
      importType: "شخصي",
      location: "المعرض",
      chassisNumber: "JTJHY7AX1K4345678",
      images: [],
      notes: "SUV فاخر - محجوز للعميل أحمد",
      isSold: false
    },
    {
      manufacturer: "لكزس",
      category: "ES 350",
      engineCapacity: "3.5L V6",
      year: 2025,
      exteriorColor: "أبيض",
      interiorColor: "أسود",
      status: "متوفر",
      importType: "شركة",
      location: "المعرض",
      chassisNumber: "58ABK1GG1NU456789",
      images: [],
      notes: "سيدان فاخر",
      isSold: false
    },
    
    // Range Rover
    {
      manufacturer: "رنج روفر",
      category: "Range Rover Vogue",
      engineCapacity: "3.0L V6",
      year: 2024,
      exteriorColor: "أسود",
      interiorColor: "بيج",
      status: "متوفر",
      importType: "شخصي",
      location: "المعرض",
      chassisNumber: "SALGS2SE1KA567890",
      images: [],
      notes: "SUV فاخر بريطاني",
      isSold: false
    },
    
    // Porsche
    {
      manufacturer: "بورش",
      category: "Cayenne",
      engineCapacity: "3.0L V6",
      year: 2024,
      exteriorColor: "رمادي",
      interiorColor: "أحمر",
      status: "في الطريق",
      importType: "شخصي",
      location: "الميناء",
      chassisNumber: "WP1AB2A27KLA678901",
      images: [],
      notes: "SUV رياضي",
      isSold: false
    }
  ];

  // الشركات المصنعة الأساسية
  const baseManufacturers = [
    { name: "مرسيدس" },
    { name: "بي ام دبليو" },
    { name: "اودي" },
    { name: "رولز رويز" },
    { name: "بنتلي" },
    { name: "رنج روفر" },
    { name: "دفندر" },
    { name: "بورش" },
    { name: "لكزس" },
    { name: "لينكون" },
    { name: "شوفولية" },
    { name: "تويوتا" },
    { name: "نيسان" },
    { name: "انفينيتي" },
    { name: "هيونداي" },
    { name: "كيا" },
    { name: "فولفو" },
    { name: "جاكوار" },
    { name: "مازيراتي" },
    { name: "فيراري" },
    { name: "لامبورغيني" },
    { name: "تسلا" },
    { name: "لوسيد" },
    { name: "كاديلاك" },
    { name: "جي ام سي" }
  ];

  try {
    // Seed manufacturers first
    const existingManufacturers = await db.select().from(manufacturers);
    
    if (existingManufacturers.length === 0) {
      await db.insert(manufacturers).values(baseManufacturers);
      console.log("Database seeded with manufacturers.");
    }

    // Seed users first
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      const hashedSellerPassword = await bcrypt.hash("seller123", 10);
      
      await db.insert(users).values([
        {
          username: "admin",
          password: hashedAdminPassword,
          role: "admin"
        },
        {
          username: "seller",
          password: hashedSellerPassword,
          role: "seller"
        }
      ]);
      console.log("Database seeded with users.");
    }

    // Check if inventory data already exists
    const existingItems = await db.select().from(inventoryItems);
    
    if (existingItems.length === 0) {
      await db.insert(inventoryItems).values(sampleItems);
      console.log("Database seeded with sample inventory items.");
    } else {
      console.log("Database already contains data, skipping inventory seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();