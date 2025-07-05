import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Bell, 
  Settings, 
  Users, 
  Palette, 
  Building2,
  LogOut,
  Home,
  MessageSquare,
  Filter,
  Edit3,
  ShoppingCart,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Moon,
  Sun,
  Calendar,
  X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import VoiceAssistant from "@/components/voice-assistant";
import { CardViewFAB } from "@/components/animated-fab";
import InventoryFormSimple from "@/components/inventory-form-simple";

import type { InventoryItem } from "@shared/schema";

interface CardViewPageProps {
  userRole: string;
  username: string;
  onLogout: () => void;
}

export default function CardViewPage({ userRole, username, onLogout }: CardViewPageProps) {
  const { companyName, companyLogo, darkMode, toggleDarkMode, isUpdatingDarkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("الكل");
  const [expandedManufacturer, setExpandedManufacturer] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sellingItemId, setSellingItemId] = useState<number | null>(null);
  const [reservingItemId, setReservingItemId] = useState<number | null>(null);
  const [cancelingReservationId, setCancelingReservationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSoldCars, setShowSoldCars] = useState<boolean>(false);

  const { data: inventoryData = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: manufacturerStats = [] } = useQuery<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
    logo: string | null;
  }>>({
    queryKey: ["/api/inventory/manufacturer-stats"],
  });

  // Filter out sold cars from display unless showSoldCars is true
  const availableItems = showSoldCars ? inventoryData : inventoryData.filter(item => item.status !== "مباع");

  // Apply search filter
  const searchFilteredItems = searchQuery.trim() === "" 
    ? availableItems 
    : availableItems.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
          item.chassisNumber?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.exteriorColor?.toLowerCase().includes(query) ||
          item.interiorColor?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          item.manufacturer?.toLowerCase().includes(query) ||
          item.engineCapacity?.toLowerCase().includes(query) ||
          item.year?.toString().includes(query) ||
          item.status?.toLowerCase().includes(query) ||
          item.importType?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
        );
      });

  // Apply manufacturer filter
  const filteredItems = selectedManufacturer === "الكل" 
    ? searchFilteredItems 
    : searchFilteredItems.filter(item => item.manufacturer === selectedManufacturer);

  // Group ALL items by manufacturer first (including sold cars for count calculation)
  const allGroupedData = inventoryData.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = {
        items: [],
        logo: null,
      };
    }
    acc[item.manufacturer].items.push(item);
    return acc;
  }, {} as Record<string, { items: InventoryItem[], logo: string | null }>);

  // Then filter for display (only available items)
  const groupedData = filteredItems.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = {
        items: [],
        logo: null,
      };
    }
    acc[item.manufacturer].items.push(item);
    return acc;
  }, {} as Record<string, { items: InventoryItem[], logo: string | null }>);

  // Get manufacturer logo
  const getManufacturerLogo = (manufacturerName: string) => {
    if (!manufacturerStats || !Array.isArray(manufacturerStats)) return null;
    const manufacturer = manufacturerStats.find((m: any) => m.manufacturer === manufacturerName);
    return manufacturer?.logo || null;
  };

  // Toggle manufacturer expansion
  const toggleManufacturer = (manufacturerName: string) => {
    setExpandedManufacturer(expandedManufacturer === manufacturerName ? null : manufacturerName);
  };

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المركبة من المخزون",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setItemToDelete(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المركبة",
        variant: "destructive",
      });
    }
  });

  // Sell item mutation
  const sellItemMutation = useMutation({
    mutationFn: (id: number) => {
      setSellingItemId(id);
      return apiRequest("POST", `/api/inventory/${id}/sell`);
    },
    onSuccess: () => {
      toast({
        title: "تم البيع بنجاح",
        description: "تم تسجيل بيع المركبة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setSellingItemId(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل بيع المركبة",
        variant: "destructive",
      });
      setSellingItemId(null);
    }
  });

  // Reserve item mutation
  const reserveItemMutation = useMutation({
    mutationFn: (data: { id: number; reservedBy: string; reservationNote?: string }) => {
      setReservingItemId(data.id);
      return apiRequest("POST", `/api/inventory/${data.id}/reserve`, {
        reservedBy: data.reservedBy,
        reservationNote: data.reservationNote
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الحجز بنجاح",
        description: "تم حجز المركبة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setReservingItemId(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حجز المركبة",
        variant: "destructive",
      });
      setReservingItemId(null);
    }
  });

  // Cancel reservation mutation
  const cancelReservationMutation = useMutation({
    mutationFn: (id: number) => {
      setCancelingReservationId(id);
      return apiRequest("POST", `/api/inventory/${id}/cancel-reservation`);
    },
    onSuccess: () => {
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء حجز المركبة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setCancelingReservationId(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء حجز المركبة",
        variant: "destructive",
      });
      setCancelingReservationId(null);
    }
  });

  // Handle delete confirmation
  const handleDeleteItem = (item: InventoryItem) => {
    setItemToDelete(item);
  };

  // Handle sell item
  const handleSellItem = (item: InventoryItem) => {
    // Prevent multiple calls by checking if already processing
    if (sellingItemId !== null) return;
    sellItemMutation.mutate(item.id);
  };

  // Handle reserve item
  const handleReserveItem = (item: InventoryItem) => {
    if (reservingItemId !== null) return;
    reserveItemMutation.mutate({
      id: item.id,
      reservedBy: username,
      reservationNote: `حجز بواسطة ${username} من واجهة البطاقات - ${new Date().toLocaleDateString('en-US')}`
    });
  };

  // Handle cancel reservation
  const handleCancelReservation = (item: InventoryItem) => {
    if (cancelingReservationId !== null) return;
    cancelReservationMutation.mutate(item.id);
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "متوفر":
        return "bg-green-100 text-green-800 border-green-200";
      case "في الطريق":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "قيد الصيانة":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "محجوز":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dynamic-gradient rounded-lg flex items-center justify-center shadow-md overflow-hidden">
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
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Home Button */}
              <Link href="/">
                <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800">
                  <Home size={16} className="ml-1" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Button>
              </Link>

              {/* Appearance Management Button - Admin Only */}
              {userRole === "admin" && (
                <Link href="/appearance">
                  <Button variant="outline" size="sm" className="text-dynamic-primary hover:text-dynamic-primary-hover hover:bg-dynamic-card border-dynamic hover:border-dynamic">
                    <Palette size={16} className="ml-1" />
                    <span className="hidden sm:inline">إدارة المظهر</span>
                    <span className="sm:hidden">المظهر</span>
                  </Button>
                </Link>
              )}

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

              {/* Logout Button */}
              <Button onClick={onLogout} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                <LogOut size={16} className="ml-1" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">عرض البطاقات التفصيلي</h1>
          <p className="text-slate-600 dark:text-slate-400">عرض جميع تفاصيل السيارات مجمعة حسب الصانع</p>
          
          {/* Search and Filter Section */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="البحث في رقم الهيكل، الفئة، اللون، الموقع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Show Sold Cars Toggle - Admin Only */}
            {userRole === "admin" && (
              <Button 
                onClick={() => setShowSoldCars(!showSoldCars)}
                variant={showSoldCars ? "default" : "outline"}
                className="text-sm"
                size="sm"
              >
                {showSoldCars ? "إخفاء السيارات المباعة" : "إظهار السيارات المباعة"}
              </Button>
            )}

            {/* Manufacturer Filter */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Filter size={18} />
              <span>تصفية حسب الصانع:</span>
              <div className="min-w-[200px]">
                <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الصانع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">
                      <div className="flex items-center gap-3">
                        <Filter size={16} />
                        <span>عرض جميع الشركات</span>
                      </div>
                    </SelectItem>
                    {manufacturerStats.map((stat) => (
                      <SelectItem key={stat.manufacturer} value={stat.manufacturer}>
                        <div className="flex items-center gap-3 group">
                          {stat.logo ? (
                            <div className="relative">
                              <img 
                                src={stat.logo} 
                                alt={stat.manufacturer}
                                className="w-6 h-6 object-contain rounded transition-all duration-200 group-hover:scale-110 group-hover:drop-shadow-sm"
                              />
                              <div className="absolute inset-0 rounded bg-dynamic-primary opacity-0 scale-125 transition-all duration-200 group-hover:opacity-10 group-hover:scale-110"></div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-600 transition-all duration-200 group-hover:bg-dynamic-card group-hover:text-dynamic-primary group-hover:scale-110">
                              {stat.manufacturer.charAt(0)}
                            </div>
                          )}
                          <span className="transition-colors duration-200 group-hover:text-dynamic-primary">{stat.manufacturer}</span>
                          <Badge variant="secondary" className="text-xs transition-all duration-200 group-hover:bg-dynamic-card group-hover:text-dynamic-primary">
                            {stat.total}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Indicator */}
        {searchQuery.trim() !== "" && (
          <div className="mb-6 p-4 bg-dynamic-card border border-dynamic rounded-lg">
            <div className="flex items-center gap-2 text-dynamic-primary">
              <Search size={18} />
              <span className="font-medium">
                نتائج البحث عن "{searchQuery}": {filteredItems.length} نتيجة
              </span>
              {filteredItems.length === 0 && (
                <span className="text-slate-600 mr-2">- لم يتم العثور على نتائج</span>
              )}
            </div>
            {filteredItems.length > 0 && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-teal-600 hover:text-teal-800 underline"
              >
                مسح البحث
              </button>
            )}
          </div>
        )}

        {/* Vehicle Cards by Manufacturer */}
        <div className="space-y-8">
          {Object.entries(groupedData)
            .filter(([manufacturer]) => selectedManufacturer === "الكل" || manufacturer === selectedManufacturer)
            .map(([manufacturer, data]) => {
            const logo = getManufacturerLogo(manufacturer);
            
            return (
              <div key={manufacturer} className="space-y-4">
                {/* Manufacturer Header - Clickable */}
                <div 
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-md hover:border-teal-300 transition-all duration-200"
                  onClick={() => toggleManufacturer(manufacturer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      {/* Manufacturer Logo with Interactive Hover Effect */}
                      <div className="relative group">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:border-teal-400 group-hover:bg-gradient-to-br group-hover:from-teal-50 group-hover:to-blue-50">
                          {logo ? (
                            <img 
                              src={logo} 
                              alt={manufacturer}
                              className="w-12 h-12 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md"
                            />
                          ) : (
                            <span className="text-xl font-bold text-slate-600 transition-all duration-300 group-hover:text-teal-700 group-hover:scale-110">
                              {manufacturer.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        {/* Hover Ring Effect */}
                        <div className="absolute inset-0 rounded-full border-2 border-dynamic-primary opacity-0 scale-125 transition-all duration-300 group-hover:opacity-50 group-hover:scale-110 pointer-events-none"></div>
                        
                        {/* Pulse Effect */}
                        <div className="absolute inset-0 rounded-full bg-dynamic-primary opacity-0 scale-150 transition-all duration-500 group-hover:opacity-20 group-hover:scale-125 group-hover:animate-pulse pointer-events-none"></div>
                      </div>
                      
                      {/* Manufacturer Name and Count */}
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{manufacturer}</h2>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Badge variant="secondary" className="bg-dynamic-card text-dynamic-primary dark:text-slate-300 px-3 py-1 text-sm font-semibold">
                            {showSoldCars 
                              ? allGroupedData[manufacturer]?.items.length || 0 
                              : allGroupedData[manufacturer]?.items.filter(item => item.status !== "مباع").length || 0} مركبة
                          </Badge>
                          <Badge variant="outline" className="border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 text-sm font-semibold">
                            {data.items.filter(item => item.status === "متوفر").length} متوفر
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="text-slate-400">
                      {expandedManufacturer === manufacturer ? (
                        <ChevronUp size={24} className="text-dynamic-primary" />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Cards Grid - Conditionally Rendered with Animation */}
                {expandedManufacturer === manufacturer && (
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-300"
                  >
                  {data.items.map((item) => (
                    <Card key={item.id} className="card-dynamic">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">{item.category}</CardTitle>
                          <Badge variant="secondary" className={`${getStatusColor(item.status)} text-xs`}>
                            {item.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">سعة المحرك:</span>
                            <span className="font-semibold font-latin text-slate-800 dark:text-slate-200">{item.engineCapacity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">السنة:</span>
                            <span className="font-semibold font-latin text-slate-800 dark:text-slate-200">{item.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">اللون الخارجي:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.exteriorColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">اللون الداخلي:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.interiorColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">نوع الاستيراد:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.importType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">الموقع:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.location}</span>
                          </div>
                          
                          {item.price && (
                            <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-700 mt-3">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">السعر:</span>
                              <span className="font-bold font-latin text-teal-700 dark:text-teal-400">{item.price}</span>
                            </div>
                          )}
                          
                          {item.chassisNumber && (
                            <div className="flex justify-between">
                              <span className="text-slate-600 font-medium">رقم الهيكل:</span>
                              <span className="font-medium font-latin text-xs text-slate-700">{item.chassisNumber}</span>
                            </div>
                          )}
                          
                          {item.entryDate && (
                            <div className="flex justify-between text-xs pt-2 border-t border-slate-100 mt-2">
                              <span className="text-slate-500">تاريخ الإدخال:</span>
                              <span className="font-medium text-slate-600">
                                {new Date(item.entryDate).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          )}
                          
                          {item.reservationDate && (
                            <div className="flex justify-between text-xs pt-2 border-t border-blue-100 mt-2 bg-blue-50 p-2 rounded">
                              <span className="text-blue-600 font-medium">تاريخ الحجز:</span>
                              <span className="font-medium text-blue-700">
                                {new Date(item.reservationDate).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          )}
                          
                          {item.notes && (
                            <div className="pt-2 border-t border-slate-100 mt-2">
                              <span className="text-slate-500 text-xs">ملاحظات:</span>
                              <p className="text-xs text-slate-700 mt-1">{item.notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-3 mt-3 border-t border-slate-200 space-y-2">
                            {/* First row - Edit and Delete */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-9 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-300"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit3 size={14} className="ml-1" />
                                تعديل
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                onClick={() => handleDeleteItem(item)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>

                            {/* Second row - Reserve/Cancel and Sell */}
                            <div className="flex gap-2">
                              {item.status === "محجوز" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                                  onClick={() => handleCancelReservation(item)}
                                  disabled={cancelingReservationId === item.id}
                                >
                                  <X size={14} className="ml-1" />
                                  {cancelingReservationId === item.id ? "جاري الإلغاء..." : "إلغاء الحجز"}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                  onClick={() => handleReserveItem(item)}
                                  disabled={reservingItemId === item.id || item.status !== "متوفر" || item.isSold}
                                >
                                  <Calendar size={14} className="ml-1" />
                                  {reservingItemId === item.id ? "جاري الحجز..." : "حجز"}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-9 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                                onClick={() => handleSellItem(item)}
                                disabled={sellingItemId === item.id}
                              >
                                <ShoppingCart size={14} className="ml-1" />
                                {sellingItemId === item.id ? "جاري البيع..." : "بيع"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {Object.keys(groupedData).length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">لا توجد مركبات متوفرة</h3>
            <p className="text-slate-500">قم بإضافة مركبات جديدة لعرضها هنا</p>
          </div>
        )}
      </div>

      {/* Animated Floating Action Button */}
      <CardViewFAB
        onVoiceChat={() => setVoiceChatOpen(true)}
        onSettings={() => {
          // Could add settings dialog for card view preferences
          console.log("Card view settings clicked");
        }}
      />

      {/* Voice Assistant Dialog */}
      <VoiceAssistant
        open={voiceChatOpen}
        onOpenChange={setVoiceChatOpen}
        onAddItem={() => {
          // Navigate to inventory page to add item
          window.location.href = '/inventory';
        }}
        onEditItem={(item) => {
          console.log('Editing item:', item);
        }}
        onSellItem={async (itemId) => {
          console.log('Selling item:', itemId);
        }}
        onDeleteItem={async (itemId) => {
          console.log('Deleting item:', itemId);
        }}
        onExtractChassisNumber={(file) => {
          console.log('Extracting chassis number from:', file);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent className="sm:max-w-md" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              تأكيد حذف المركبة
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              هل أنت متأكد من حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء.
              <br />
              <br />
              <span className="font-semibold">
                {itemToDelete?.manufacturer} {itemToDelete?.category} - {itemToDelete?.year}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteItemMutation.mutate(itemToDelete.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Item Form */}
      <InventoryFormSimple
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        editItem={editingItem || undefined}
      />
    </div>
  );
}