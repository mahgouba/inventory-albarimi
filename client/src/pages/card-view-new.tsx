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
  ChevronUp
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  onLogout: () => void;
}

export default function CardViewPage({ userRole, onLogout }: CardViewPageProps) {
  const { companyName } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("الكل");
  const [expandedManufacturer, setExpandedManufacturer] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sellingItemId, setSellingItemId] = useState<number | null>(null);

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

  // Filter out sold cars from display
  const availableItems = inventoryData.filter(item => !item.isSold);

  // Apply manufacturer filter
  const filteredItems = selectedManufacturer === "الكل" 
    ? availableItems 
    : availableItems.filter(item => item.manufacturer === selectedManufacturer);

  // Group items by manufacturer
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
      return apiRequest("PUT", `/api/inventory/${id}/sell`);
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
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg sm:text-xl">ش</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">{companyName}</h1>
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

              {/* Appearance Management Button */}
              <Link href="/appearance">
                <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200">
                  <Palette size={16} className="ml-1" />
                  <span className="hidden sm:inline">إدارة المظهر</span>
                  <span className="sm:hidden">المظهر</span>
                </Button>
              </Link>

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
                    <Link href="/users">
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        إدارة المستخدمين
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/manufacturers">
                      <DropdownMenuItem>
                        <Building2 className="mr-2 h-4 w-4" />
                        إدارة الشركات المصنعة
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">عرض البطاقات التفصيلي</h1>
          <p className="text-slate-600">عرض جميع تفاصيل السيارات مجمعة حسب الصانع</p>
          
          {/* Manufacturer Filter */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Filter size={18} />
              <span>تصفية حسب الصانع:</span>
            </div>
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
                      <div className="flex items-center gap-3">
                        {stat.logo ? (
                          <img 
                            src={stat.logo} 
                            alt={stat.manufacturer}
                            className="w-6 h-6 object-contain rounded"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-600">
                            {stat.manufacturer.charAt(0)}
                          </div>
                        )}
                        <span>{stat.manufacturer}</span>
                        <Badge variant="secondary" className="text-xs">
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
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md hover:border-teal-300 transition-all duration-200"
                  onClick={() => toggleManufacturer(manufacturer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      {/* Manufacturer Logo */}
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 shadow-sm">
                        {logo ? (
                          <img 
                            src={logo} 
                            alt={manufacturer}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-xl font-bold text-slate-600">
                            {manufacturer.charAt(0)}
                          </span>
                        )}
                      </div>
                      
                      {/* Manufacturer Name and Count */}
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{manufacturer}</h2>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700 px-3 py-1 text-sm font-semibold">
                            {data.items.length} مركبة
                          </Badge>
                          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 px-3 py-1 text-sm font-semibold">
                            {data.items.filter(item => item.status === "متوفر").length} متوفر
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="text-slate-400">
                      {expandedManufacturer === manufacturer ? (
                        <ChevronUp size={24} className="text-teal-600" />
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
                    <Card key={item.id} className="border border-slate-200 hover:shadow-lg hover:border-teal-300 transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-slate-800">{item.category}</CardTitle>
                          <Badge variant="secondary" className={`${getStatusColor(item.status)} text-xs`}>
                            {item.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">سعة المحرك:</span>
                            <span className="font-semibold font-latin text-slate-800">{item.engineCapacity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">السنة:</span>
                            <span className="font-semibold font-latin text-slate-800">{item.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">اللون الخارجي:</span>
                            <span className="font-semibold text-slate-800">{item.exteriorColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">اللون الداخلي:</span>
                            <span className="font-semibold text-slate-800">{item.interiorColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">نوع الاستيراد:</span>
                            <span className="font-semibold text-slate-800">{item.importType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">الموقع:</span>
                            <span className="font-semibold text-slate-800">{item.location}</span>
                          </div>
                          
                          {item.price && (
                            <div className="flex justify-between py-2 border-t border-slate-200 mt-3">
                              <span className="text-slate-600 font-medium">السعر:</span>
                              <span className="font-bold font-latin text-teal-700">{item.price}</span>
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
                                {new Date(item.entryDate).toLocaleDateString('ar-SA')}
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
                          <div className="flex gap-2 pt-3 mt-3 border-t border-slate-200">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit3 size={12} className="ml-1" />
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              onClick={() => handleSellItem(item)}
                              disabled={sellingItemId === item.id}
                            >
                              <ShoppingCart size={12} className="ml-1" />
                              {sellingItemId === item.id ? "جاري البيع..." : "بيع"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleDeleteItem(item)}
                            >
                              <Trash2 size={12} />
                            </Button>
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