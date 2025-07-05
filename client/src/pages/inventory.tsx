import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Download, Printer, Bell, UserCircle, FileSpreadsheet, LayoutGrid, Table, DollarSign, Settings, LogOut, Palette, Users, MapPin, Building2, MessageSquare, Moon, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import InventoryStats from "@/components/inventory-stats";
import InventoryTable from "@/components/inventory-table";
import InventoryFormSimple from "@/components/inventory-form-simple";
import ExcelImport from "@/components/excel-import";

import VoiceAssistant from "@/components/voice-assistant";
import { InventoryFAB } from "@/components/animated-fab";
import { exportToCSV, exportToExcel, printTable } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";

interface InventoryPageProps {
  userRole: string;
  username: string;
  onLogout: () => void;
}

export default function InventoryPage({ userRole, username, onLogout }: InventoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("جميع الفئات");
  const [manufacturerFilter, setManufacturerFilter] = useState("جميع الصناع");
  const [yearFilter, setYearFilter] = useState("جميع السنوات");
  const [importTypeFilter, setImportTypeFilter] = useState("جميع الأنواع");
  const [locationFilter, setLocationFilter] = useState("");
  const [engineCapacityFilter, setEngineCapacityFilter] = useState("جميع السعات");
  const [showSoldCars, setShowSoldCars] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | undefined>(undefined);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get theme settings
  const { companyName, companyLogo, darkMode, toggleDarkMode, isUpdatingDarkMode } = useTheme();

  const { data: items = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const manufacturers = ["جميع الصناع", "مرسيدس", "بي ام دبليو", "اودي", "تويوتا", "لكزس", "رنج روفر", "بورش", "نيسان", "انفينيتي", "هيونداي", "كيا", "فولفو", "جاكوار", "مازيراتي", "فيراري", "لامبورغيني", "تسلا", "لوسيد", "كاديلاك", "جي ام سي"];
  
  // Generate categories based on selected manufacturer
  const manufacturerCategories: Record<string, string[]> = {
    "مرسيدس": ["S-Class", "E-Class", "C-Class", "GLE", "GLS", "A-Class", "CLA", "CLS", "G-Class", "GLC"],
    "بي ام دبليو": ["7 Series", "5 Series", "3 Series", "X7", "X5", "X3", "X1", "i8", "M3", "M5"],
    "اودي": ["A8", "A6", "A4", "Q8", "Q7", "Q5", "Q3", "A3", "TT", "RS6", "e-tron"],
    "تويوتا": ["لاند كروزر", "كامري", "كورولا", "هايلاندر", "بريوس", "أفالون", "RAV4", "سيكويا"],
    "لكزس": ["LX 600", "GX 460", "RX 350", "ES 350", "LS 500", "IS 350", "UX 250h", "LC 500"],
    "رنج روفر": ["Range Rover Vogue", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar", "Discovery", "Defender"],
    "بورش": ["Cayenne", "Macan", "911", "Panamera", "Taycan", "718"],
    "نيسان": ["باترول", "التيما", "ماكسيما", "اكس تريل", "سنترا", "مورانو", "أرمادا", "Z"],
    "انفينيتي": ["QX80", "QX60", "QX50", "Q50", "Q60", "QX55"],
    "هيونداي": ["النترا", "سوناتا", "توسان", "سانتا في", "باليسايد", "أكسنت", "فيلوستر"],
    "كيا": ["سورينتو", "تيلورايد", "سيراتو", "أوبتيما", "سبورتاج", "كارنيفال", "ستينغر"],
    "فولفو": ["XC90", "XC60", "S90", "V90", "S60", "XC40"],
    "جاكوار": ["F-PACE", "I-PACE", "XF", "XE", "F-TYPE"],
    "مازيراتي": ["Levante", "Ghibli", "Quattroporte", "GranTurismo"],
    "فيراري": ["488", "F8", "Roma", "Portofino", "SF90"],
    "لامبورغيني": ["Aventador", "Huracan", "Urus"],
    "تسلا": ["Model S", "Model 3", "Model X", "Model Y"],
    "لوسيد": ["Air Dream", "Air Touring", "Air Pure"],
    "كاديلاك": ["Escalade", "XT6", "XT5", "XT4", "CT5"],
    "جي ام سي": ["Yukon", "Tahoe", "Sierra", "Canyon", "Terrain"]
  };
  
  // Get categories based on selected manufacturer
  const getAvailableCategories = () => {
    if (!manufacturerFilter || manufacturerFilter === "جميع الصناع") {
      return ["جميع الفئات"];
    }
    const manufacturerCats = manufacturerCategories[manufacturerFilter] || [];
    return ["جميع الفئات", ...manufacturerCats];
  };
  
  const categories = getAvailableCategories();
  const years = ["جميع السنوات", "2025", "2024", "2023", "2022", "2021"];
  const importTypes = ["جميع الأنواع", "شخصي", "شركة", "مستعمل شخصي"];
  const locations = ["المستودع الرئيسي", "المعرض", "الورشة", "الميناء", "مستودع فرعي"];
  const engineCapacities = ["جميع السعات", "2.0L", "1.5L", "3.0L", "4.0L", "5.0L", "V6", "V8"];

  const handleExport = () => {
    exportToExcel(items, "تصدير-المخزون.xlsx");
  };

  const handlePrint = () => {
    printTable();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditItem(undefined);
  };





  // Reset category filter when manufacturer changes
  const handleManufacturerChange = (value: string) => {
    setManufacturerFilter(value);
    setCategoryFilter("جميع الفئات");
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="شعار الشركة" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-white font-bold text-lg sm:text-xl">ش</span>
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">{companyName}</h1>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-latin">Inventory System</span>
              </div>
            </div>
            {/* Mobile and Desktop Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              {/* Navigation Tabs - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2 space-x-reverse border border-slate-200 rounded-lg p-1">
                <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Table size={14} className="ml-1" />
                  <span className="hidden lg:inline">جدول</span>
                </Button>
                <Link href="/cards">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                    <LayoutGrid size={14} className="ml-1" />
                    <span className="hidden lg:inline">بطاقات</span>
                  </Button>
                </Link>
              </div>
              
              {/* Mobile Navigation Icons */}
              <div className="flex md:hidden items-center space-x-1 space-x-reverse">
                <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white p-2">
                  <Table size={16} />
                </Button>
                <Link href="/cards">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 p-2">
                    <LayoutGrid size={16} />
                  </Button>
                </Link>
              </div>

              {/* Admin Management Buttons - Admin Only */}
              {userRole === "admin" && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link href="/appearance">
                    <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200 transition-colors">
                      <Palette size={16} className="ml-1" />
                      <span className="hidden sm:inline">إدارة المظهر</span>
                      <span className="sm:hidden">المظهر</span>
                    </Button>
                  </Link>
                  
                  <Link href="/user-management">
                    <Button variant="outline" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 transition-colors">
                      <Users size={16} className="ml-1" />
                      <span className="hidden sm:inline">إدارة المستخدمين</span>
                      <span className="sm:hidden">المستخدمين</span>
                    </Button>
                  </Link>

                </div>
              )}



              {/* User Actions */}
              <div className="flex items-center space-x-1 space-x-reverse">
                {/* Dark Mode Toggle */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100" 
                  onClick={toggleDarkMode}
                  disabled={isUpdatingDarkMode}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                

                
                {/* Admin Dropdown Menu */}
                {userRole === "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                        <Settings size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <Link href="/appearance">
                        <DropdownMenuItem>
                          <Palette className="mr-2 h-4 w-4" />
                          إدارة المظهر
                        </DropdownMenuItem>
                      </Link>


                      <Link href="/user-management">
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          إدارة المستخدمين
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                      <UserCircle size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-sm text-slate-500 cursor-default">
                      <UserCircle className="mr-2 h-4 w-4" />
                      المستخدم: {userRole === "admin" ? "أدمن" : "مستخدم"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 hover:bg-red-50 cursor-pointer"
                      onClick={onLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <InventoryStats />

        {/* Controls */}
        <Card className="mb-8 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="w-full">
                <div className="relative max-w-md">
                  <Input
                    type="text"
                    placeholder="البحث في المخزون..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={manufacturerFilter} onValueChange={handleManufacturerChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={importTypeFilter} onValueChange={setImportTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {importTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={engineCapacityFilter} onValueChange={setEngineCapacityFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {engineCapacities.map((capacity) => (
                      <SelectItem key={capacity} value={capacity}>
                        {capacity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Admin-only buttons */}
                {userRole === "admin" && (
                  <>
                    <Button 
                      onClick={() => setFormOpen(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة عنصر
                    </Button>
                    <Button 
                      onClick={() => setIsExcelImportOpen(true)}
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50 w-full sm:w-auto"
                    >
                      <FileSpreadsheet className="w-4 h-4 ml-2" />
                      استيراد Excel
                    </Button>
                  </>
                )}
                
                {/* Voice Assistant - Available for all users */}
                <Button 
                  onClick={() => setVoiceChatOpen(true)}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  المساعد الصوتي
                </Button>
                <Button 
                  onClick={handleExport}
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                {/* Show Sold Cars Button - Admin Only */}
                {userRole === "admin" && (
                  <Button 
                    onClick={() => setShowSoldCars(!showSoldCars)}
                    variant={showSoldCars ? "default" : "outline"}
                    className={showSoldCars ? "bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" : "border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto"}
                  >
                    <DollarSign className="w-4 h-4 ml-2" />
                    {showSoldCars ? "إخفاء السيارات المباعة" : "إظهار السيارات المباعة"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <InventoryTable
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          manufacturerFilter={manufacturerFilter}
          yearFilter={yearFilter}
          importTypeFilter={importTypeFilter}
          engineCapacityFilter={engineCapacityFilter}
          showSoldCars={showSoldCars}
          userRole={userRole}
          username={username}
          onEdit={handleEdit}
        />

        {/* Pagination */}
        <div className="flex items-center justify-end mt-8">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              السابق
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "bg-teal-600 hover:bg-teal-700" : ""}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      </main>

      {/* Animated Floating Action Button */}
      <InventoryFAB
        onAddItem={userRole === "admin" ? () => setFormOpen(true) : undefined}
        onSearch={() => {
          // Focus on search input if visible, or scroll to search area
          const searchInput = document.querySelector('input[placeholder*="البحث"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onExport={handleExport}
        onPrint={handlePrint}
        onVoiceChat={() => setVoiceChatOpen(true)}
        userRole={userRole}
      />

      {/* Add/Edit Form */}
      <InventoryFormSimple 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        editItem={editItem}
      />

      {/* Excel Import Dialog */}
      <ExcelImport 
        open={isExcelImportOpen} 
        onOpenChange={setIsExcelImportOpen} 
      />



      {/* Voice Assistant Dialog */}
      <VoiceAssistant
        open={voiceChatOpen}
        onOpenChange={setVoiceChatOpen}
        onAddItem={() => setFormOpen(true)}
        onEditItem={(item) => {
          setEditItem(item);
          setFormOpen(true);
        }}
        onSellItem={async (itemId) => {
          // Handle sell item
          console.log('Selling item:', itemId);
        }}
        onDeleteItem={async (itemId) => {
          // Handle delete item
          console.log('Deleting item:', itemId);
        }}
        onExtractChassisNumber={(file) => {
          console.log('Extracting chassis number from:', file);
        }}
      />
    </div>
  );
}
