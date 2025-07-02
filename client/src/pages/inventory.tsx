import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Download, Printer, Bell, UserCircle } from "lucide-react";
import InventoryStats from "@/components/inventory-stats";
import InventoryTable from "@/components/inventory-table";
import InventoryForm from "@/components/inventory-form";
import { exportToCSV, printTable } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("جميع الفئات");
  const [yearFilter, setYearFilter] = useState("جميع السنوات");
  const [formOpen, setFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const categories = ["جميع الفئات", "لاتوبيغرافي", "أوتوماتيكي", "يدوي"];
  const years = ["جميع السنوات", "2025", "2024", "2023"];

  const handleExport = () => {
    exportToCSV(items, "inventory-export.csv");
  };

  const handlePrint = () => {
    printTable();
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
              <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                <UserCircle size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 space-x-reverse">
            <Button className="px-4 py-3 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-t-lg border-b-2 border-amber-600">
              البحث
            </Button>
            <Button className="px-4 py-3 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-t-lg border-b-2 border-amber-600">
              الهيكل
            </Button>
            <Button className="px-4 py-3 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-t-lg border-b-2 border-amber-600">
              البوع
            </Button>
            <Button className="px-4 py-3 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-t-lg border-b-2 border-amber-600">
              المحرك
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <InventoryStats />

        {/* Controls */}
        <Card className="mb-8 border border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
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
              <div className="flex items-center space-x-4 space-x-reverse">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
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
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-40">
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
                <Button 
                  onClick={() => setFormOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عنصر
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <InventoryTable
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          yearFilter={yearFilter}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-slate-600">
            عرض <span className="font-medium">1</span> إلى{" "}
            <span className="font-medium">{Math.min(itemsPerPage, items.length)}</span> من{" "}
            <span className="font-medium">{items.length}</span> نتيجة
          </p>
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
      <InventoryForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
