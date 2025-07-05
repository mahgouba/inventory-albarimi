import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Images, ArrowUpDown, ShoppingCart, DollarSign, Calendar, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getStatusColor } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";
import InventoryForm from "./inventory-form";

interface InventoryTableProps {
  searchQuery: string;
  categoryFilter: string;
  manufacturerFilter: string;
  yearFilter: string;
  importTypeFilter: string;
  engineCapacityFilter: string;
  showSoldCars: boolean;
  userRole: string;
  username: string;
  onEdit?: (item: InventoryItem) => void;
}

export default function InventoryTable({ searchQuery, categoryFilter, manufacturerFilter, yearFilter, importTypeFilter, engineCapacityFilter, showSoldCars, userRole, username, onEdit }: InventoryTableProps) {
  const [editItem, setEditItem] = useState<InventoryItem | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف العنصر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف العنصر",
        variant: "destructive",
      });
    },
  });

  const sellMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/inventory/${id}/sell`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديد السيارة كمباعة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديد السيارة كمباعة",
        variant: "destructive",
      });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (data: { id: number; reservedBy: string; reservationNote?: string }) => 
      apiRequest("POST", `/api/inventory/${data.id}/reserve`, {
        reservedBy: data.reservedBy,
        reservationNote: data.reservationNote
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم الحجز",
        description: "تم حجز المركبة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حجز المركبة",
        variant: "destructive",
      });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/inventory/${id}/cancel-reservation`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء حجز المركبة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء حجز المركبة",
        variant: "destructive",
      });
    },
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleEdit = (item: InventoryItem) => {
    if (onEdit) {
      onEdit(item);
    } else {
      setEditItem(item);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSell = (id: number) => {
    if (window.confirm("هل أنت متأكد من تحديد هذه السيارة كمباعة؟")) {
      sellMutation.mutate(id);
    }
  };

  const handleReserve = (id: number) => {
    if (window.confirm("هل أنت متأكد من حجز هذه السيارة؟")) {
      reserveMutation.mutate({
        id,
        reservedBy: username,
        reservationNote: `حجز بواسطة ${username} - ${new Date().toLocaleDateString('en-US')}`
      });
    }
  };

  const handleCancelReservation = (id: number) => {
    if (window.confirm("هل أنت متأكد من إلغاء حجز هذه السيارة؟")) {
      cancelReservationMutation.mutate(id);
    }
  };

  const filteredAndSortedItems = items
    .filter((item: InventoryItem) => {
      const matchesSearch = !searchQuery || 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory = !categoryFilter || categoryFilter === "جميع الفئات" || item.category === categoryFilter;
      const matchesManufacturer = !manufacturerFilter || manufacturerFilter === "جميع الصناع" || item.manufacturer === manufacturerFilter;
      const matchesYear = !yearFilter || yearFilter === "جميع السنوات" || item.year.toString() === yearFilter;
      const matchesImportType = !importTypeFilter || importTypeFilter === "جميع الأنواع" || item.importType === importTypeFilter;
      const matchesEngineCapacity = !engineCapacityFilter || engineCapacityFilter === "جميع السعات" || item.engineCapacity === engineCapacityFilter;
      // إذا كان إظهار السيارات المباعة مفعلاً، اعرض جميع السيارات
      // إذا كان مطفياً، اعرض فقط السيارات غير المباعة
      const matchesSoldFilter = showSoldCars ? true : !item.isSold;
      
      return matchesSearch && matchesCategory && matchesManufacturer && matchesYear && matchesImportType && matchesEngineCapacity && matchesSoldFilter;
    })
    .sort((a: InventoryItem, b: InventoryItem) => {
      if (!sortColumn) return 0;
      
      const aValue = a[sortColumn as keyof InventoryItem];
      const bValue = b[sortColumn as keyof InventoryItem];
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table data-table="inventory-table">
          <TableHeader className="bg-teal-600">
            <TableRow>
              <TableHead className="text-white text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-teal-100 hover:bg-teal-700 p-1"
                  onClick={() => handleSort("manufacturer")}
                >
                  الصانع
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>

              <TableHead className="text-white text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-teal-100 hover:bg-teal-700 p-1"
                  onClick={() => handleSort("category")}
                >
                  الفئة
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-white text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-teal-100 hover:bg-teal-700 p-1"
                  onClick={() => handleSort("engineCapacity")}
                >
                  سعة المحرك
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-white text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-teal-100 hover:bg-teal-700 p-1"
                  onClick={() => handleSort("year")}
                >
                  السنة
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-white text-right">اللون الخارجي</TableHead>
              <TableHead className="text-white text-right">اللون الداخلي</TableHead>
              <TableHead className="text-white text-right">الحالة</TableHead>
              <TableHead className="text-white text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-teal-100 hover:bg-teal-700 p-1"
                  onClick={() => handleSort("location")}
                >
                  الموقع
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-white text-right">الاستيراد</TableHead>
              <TableHead className="text-white text-right">رقم الهيكل</TableHead>
              <TableHead className="text-white text-right">الصور</TableHead>
              <TableHead className="text-white text-right">تاريخ الدخول</TableHead>
              <TableHead className="text-white text-right">السعر</TableHead>
              <TableHead className="text-white text-right">الملاحظات</TableHead>
              <TableHead className="text-white text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-8">
                  <p className="text-slate-500">لا توجد عناصر للعرض</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedItems.map((item: InventoryItem) => (
                <TableRow key={item.id} className={`hover:bg-slate-50 ${item.isSold ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                  <TableCell className="text-sm text-slate-800">{item.manufacturer}</TableCell>

                  <TableCell className="text-sm text-slate-800">{item.category}</TableCell>
                  <TableCell className="text-sm text-slate-800 font-latin">{item.engineCapacity}</TableCell>
                  <TableCell className="text-sm text-slate-800 font-latin">{item.year}</TableCell>
                  <TableCell className="text-sm text-slate-800">{item.exteriorColor}</TableCell>
                  <TableCell className="text-sm text-slate-800">{item.interiorColor}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-800">{item.location}</TableCell>
                  <TableCell className="text-sm text-slate-800">{item.importType}</TableCell>
                  <TableCell className="text-sm text-slate-600 font-latin">{item.chassisNumber}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-800">
                      <Images className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 font-latin">
                    {new Date(item.entryDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800 font-latin">
                    {item.price ? `${parseFloat(item.price).toLocaleString()} ر.س` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="text-teal-600 hover:text-teal-800 p-1"
                        title="تحرير"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="حذف"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {item.status === "محجوز" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelReservation(item.id)}
                          className="text-orange-600 hover:text-orange-800 p-1"
                          title="إلغاء الحجز"
                          disabled={cancelReservationMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReserve(item.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="حجز"
                          disabled={reserveMutation.isPending || item.status !== "متوفر" || item.isSold}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSell(item.id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="بيع"
                        disabled={sellMutation.isPending || item.isSold}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>



      <InventoryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditItem(undefined);
        }}
        editItem={editItem}
      />
    </div>
  );
}
