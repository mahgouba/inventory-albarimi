import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MapPin, 
  Building2, 
  Users, 
  Phone, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  Home,
  Truck,
  History,
  Settings,
  LogOut
} from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import type { Location, InsertLocation, LocationTransfer, InventoryItem } from "@shared/schema";
import { insertLocationSchema } from "@shared/schema";

interface LocationPageProps {
  userRole: string;
  onLogout: () => void;
}

export default function LocationPage({ userRole, onLogout }: LocationPageProps) {
  const { toast } = useToast();
  const { companyName } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Queries
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: locationStats = [] } = useQuery({
    queryKey: ["/api/inventory/location-stats"],
  });

  const { data: transfers = [], isLoading: transfersLoading } = useQuery<LocationTransfer[]>({
    queryKey: ["/api/location-transfers"],
  });

  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Form for adding/editing locations
  const form = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      manager: "",
      phone: "",
      capacity: null,
      isActive: true,
    },
  });

  // Mutations
  const createLocationMutation = useMutation({
    mutationFn: (data: InsertLocation) => apiRequest("POST", "/api/locations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/location-stats"] });
      toast({ title: "تم إنشاء الموقع بنجاح" });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء الموقع", variant: "destructive" });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertLocation> }) =>
      apiRequest("PUT", `/api/locations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/location-stats"] });
      toast({ title: "تم تحديث الموقع بنجاح" });
      setIsEditDialogOpen(false);
      setSelectedLocation(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "خطأ في تحديث الموقع", variant: "destructive" });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/location-stats"] });
      toast({ title: "تم حذف الموقع بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف الموقع", variant: "destructive" });
    },
  });

  // Helper functions
  const getLocationStats = (locationName: string) => {
    return locationStats.find((stat: any) => stat.location === locationName) || {
      total: 0,
      available: 0,
      inTransit: 0,
      maintenance: 0,
      sold: 0,
    };
  };

  const getVehiclesInLocation = (locationName: string) => {
    return inventoryItems.filter(item => item.location === locationName && !item.isSold);
  };

  const onSubmit = (data: InsertLocation) => {
    if (selectedLocation) {
      updateLocationMutation.mutate({ id: selectedLocation.id, data });
    } else {
      createLocationMutation.mutate(data);
    }
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    form.reset({
      name: location.name,
      description: location.description || "",
      address: location.address || "",
      manager: location.manager || "",
      phone: location.phone || "",
      capacity: location.capacity,
      isActive: location.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (location: Location) => {
    if (confirm(`هل أنت متأكد من حذف موقع "${location.name}"؟`)) {
      deleteLocationMutation.mutate(location.id);
    }
  };

  if (locationsLoading) {
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
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg sm:text-xl">ش</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">{companyName}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800">
                  <Home size={16} className="ml-1" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Button>
              </Link>

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
                        <Settings className="mr-2 h-4 w-4" />
                        إدارة المظهر
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/user-management">
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">إدارة المواقع</h1>
              <p className="text-slate-600">إدارة مواقع تخزين المركبات ونقلها</p>
            </div>
            {userRole === "admin" && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus size={20} className="ml-2" />
                    إضافة موقع جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة موقع جديد</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم الموقع</FormLabel>
                            <FormControl>
                              <Input placeholder="المعرض الرئيسي" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الوصف</FormLabel>
                            <FormControl>
                              <Textarea placeholder="وصف مختصر للموقع" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العنوان</FormLabel>
                            <FormControl>
                              <Input placeholder="العنوان الكامل" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="manager"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المدير المسؤول</FormLabel>
                              <FormControl>
                                <Input placeholder="اسم المدير" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الهاتف</FormLabel>
                              <FormControl>
                                <Input placeholder="+968 9XXX XXXX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>السعة الاستيعابية</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="عدد المركبات"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          إلغاء
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createLocationMutation.isPending}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          {createLocationMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Locations Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {locations.map((location) => {
            const stats = getLocationStats(location.name);
            const vehicles = getVehiclesInLocation(location.name);
            
            return (
              <Card key={location.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <MapPin className="h-5 w-5 text-teal-600" />
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                    </div>
                    {userRole === "admin" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(location)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(location)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {location.description && (
                    <p className="text-sm text-slate-600">{location.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-slate-50 rounded">
                        <div className="text-lg font-bold text-slate-800">{stats.total}</div>
                        <div className="text-xs text-slate-600">إجمالي</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{stats.available}</div>
                        <div className="text-xs text-green-600">متوفر</div>
                      </div>
                    </div>

                    {/* Location Details */}
                    {location.manager && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="h-4 w-4 ml-2" />
                        {location.manager}
                      </div>
                    )}
                    
                    {location.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-4 w-4 ml-2" />
                        {location.phone}
                      </div>
                    )}

                    {location.capacity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">السعة:</span>
                        <span className="font-medium">
                          {stats.total} / {location.capacity}
                        </span>
                      </div>
                    )}

                    <Badge 
                      variant={location.isActive ? "default" : "secondary"}
                      className={location.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {location.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Tables */}
        <Tabs defaultValue="transfers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transfers" className="flex items-center space-x-2 space-x-reverse">
              <Truck className="h-4 w-4" />
              <span>سجل النقل</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center space-x-2 space-x-reverse">
              <History className="h-4 w-4" />
              <span>تفاصيل المواقع</span>
            </TabsTrigger>
          </TabsList>

          {/* Location Transfers Tab */}
          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>سجل نقل المركبات</CardTitle>
              </CardHeader>
              <CardContent>
                {transfersLoading ? (
                  <div className="text-center py-4">جاري التحميل...</div>
                ) : transfers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    لا توجد عمليات نقل مسجلة
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المركبة</TableHead>
                        <TableHead>من</TableHead>
                        <TableHead>إلى</TableHead>
                        <TableHead>السبب</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>نقل بواسطة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers.map((transfer) => {
                        const vehicle = inventoryItems.find(item => item.id === transfer.inventoryItemId);
                        return (
                          <TableRow key={transfer.id}>
                            <TableCell>
                              {vehicle ? `${vehicle.manufacturer} ${vehicle.category}` : 'مركبة محذوفة'}
                            </TableCell>
                            <TableCell>{transfer.fromLocation}</TableCell>
                            <TableCell>{transfer.toLocation}</TableCell>
                            <TableCell>{transfer.reason || '-'}</TableCell>
                            <TableCell>
                              {new Date(transfer.transferDate).toLocaleDateString('ar-SA')}
                            </TableCell>
                            <TableCell>{transfer.transferredBy || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل المواقع</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الموقع</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>المدير</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>السعة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجمالي المركبات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => {
                      const stats = getLocationStats(location.name);
                      return (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>{location.address || '-'}</TableCell>
                          <TableCell>{location.manager || '-'}</TableCell>
                          <TableCell>{location.phone || '-'}</TableCell>
                          <TableCell>{location.capacity || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={location.isActive ? "default" : "secondary"}>
                              {location.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                          </TableCell>
                          <TableCell>{stats.total}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل الموقع</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الموقع</FormLabel>
                      <FormControl>
                        <Input placeholder="المعرض الرئيسي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea placeholder="وصف مختصر للموقع" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input placeholder="العنوان الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدير المسؤول</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم المدير" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="+968 9XXX XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعة الاستيعابية</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="عدد المركبات"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حالة الموقع</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">نشط</SelectItem>
                          <SelectItem value="false">غير نشط</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedLocation(null);
                      form.reset();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateLocationMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {updateLocationMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}