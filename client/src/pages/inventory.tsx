import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Download, Printer, Bell, UserCircle, FileSpreadsheet, LayoutGrid, Table, DollarSign } from "lucide-react";
import InventoryStats from "@/components/inventory-stats";
import InventoryTable from "@/components/inventory-table";
import InventoryForm from "@/components/inventory-form";
import ExcelImport from "@/components/excel-import";
import { exportToCSV, exportToExcel, printTable } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";

interface InventoryPageProps {
  userRole: string;
}

export default function InventoryPage({ userRole }: InventoryPageProps) {
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const manufacturers = ["جميع الصناع", "مرسيدس", "بي ام دبليو", "اودي", "تويوتا", "نيسان", "هوندا", "فورد", "هيونداي"];
  
  // Generate categories based on selected manufacturer
  const manufacturerCategories: Record<string, string[]> = {
    "مرسيدس": ["E200", "C200", "C300", "S500", "GLE", "CLA", "A200"],
    "بي ام دبليو": ["X5", "X3", "X6", "320i", "520i", "730i", "M3"],
    "اودي": ["A4", "A6", "Q5", "Q7", "A3", "TT", "RS6"],
    "تويوتا": ["كامري", "كورولا", "لاند كروزر", "هايلاندر", "يارس", "أفالون"],
    "نيسان": ["التيما", "ماكسيما", "باترول", "اكس تريل", "سنترا", "مورانو"],
    "هوندا": ["أكورد", "سيفيك", "بايلوت", "CR-V", "HR-V"],
    "فورد": ["فوكس", "فيوجن", "اكسبلورر", "F-150", "موستانغ"],
    "هيونداي": ["النترا", "سوناتا", "توسان", "سانتا في", "أكسنت"]
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
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <h1 className="text-2xl font-bold text-slate-800">نظام إدارة المخزون</h1>
              <span className="text-sm text-slate-500 font-latin">Inventory Management</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse border border-slate-200 rounded-lg p-1">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  <Table size={16} className="ml-1" />
                  جدول
                </Button>
                <Link href="/cards">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                    <LayoutGrid size={16} className="ml-1" />
                    بطاقات
                  </Button>
                </Link>
              </div>
              <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                <UserCircle size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => window.location.href = '/login'}
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <InventoryStats />

        {/* Controls */}
        <Card className="mb-8 border border-slate-200">
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
                <Button 
                  onClick={() => setShowSoldCars(!showSoldCars)}
                  variant={showSoldCars ? "default" : "outline"}
                  className={showSoldCars ? "bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" : "border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto"}
                >
                  <DollarSign className="w-4 h-4 ml-2" />
                  {showSoldCars ? "إخفاء السيارات المباعة" : "إظهار السيارات المباعة"}
                </Button>
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 flex flex-col space-y-2">
        <Button
          onClick={handleExport}
          className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg"
          title="تصدير البيانات"
        >
          <Download size={20} />
        </Button>
        <Button
          onClick={handlePrint}
          className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg"
          title="طباعة التقرير"
        >
          <Printer size={20} />
        </Button>
      </div>

      {/* Add/Edit Form */}
      <InventoryForm 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        editItem={editItem}
      />

      {/* Excel Import Dialog */}
      <ExcelImport 
        open={isExcelImportOpen} 
        onOpenChange={setIsExcelImportOpen} 
      />
    </div>
  );
}
