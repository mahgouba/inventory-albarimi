import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventoryItemSchema, type InsertInventoryItem, type InventoryItem } from "@shared/schema";
import { CloudUpload, Settings, Camera } from "lucide-react";
import ListManagerSimple from "@/components/list-manager-simple";
import ManufacturerCategoriesButton from "@/components/manufacturer-categories-button";
import ChassisNumberScanner from "@/components/chassis-number-scanner";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

const manufacturerCategories: Record<string, string[]> = {
  "مرسيدس": ["E200", "C200", "C300", "S500", "GLE", "CLA", "A200"],
  "بي ام دبليو": ["X5", "X3", "X6", "320i", "520i", "730i", "M3"],
  "رولز رويز": ["Phantom", "Ghost", "Wraith", "Cullinan"],
  "بنتلي": ["Continental", "Bentayga", "Flying Spur", "Mulsanne"],
  "رنج روفر": ["Vogue", "Sport", "Evoque", "Velar"],
  "دفندر": ["90", "110", "130"],
  "بورش": ["911", "Cayenne", "Macan", "Panamera"],
  "لكزس": ["LX", "GX", "RX", "ES", "LS"],
  "لينكون": ["Navigator", "Aviator", "Corsair", "Continental"],
  "شوفولية": ["Tahoe", "Suburban", "Silverado", "Camaro"],
  "تويوتا": ["كامري", "كورولا", "لاند كروزر", "هايلاندر", "يارس", "أفالون"],
  "تسلا": ["Model S", "Model 3", "Model X", "Model Y"],
  "لوسيد": ["Air Dream", "Air Touring", "Air Pure"]
};

const initialManufacturers = Object.keys(manufacturerCategories);
const initialEngineCapacities = ["2.0L", "1.5L", "3.0L", "4.0L", "5.0L", "V6", "V8", "Electric"];
const initialYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const initialStatuses = ["متوفر", "في الطريق", "قيد الصيانة", "محجوز", "مباع"];
const initialImportTypes = ["شخصي", "شركة", "مستعمل شخصي"];
const initialLocations = ["المستودع الرئيسي", "المعرض", "الورشة", "الميناء", "مستودع فرعي"];
const initialColors = ["أسود", "أبيض", "رمادي", "أزرق", "أحمر", "بني", "فضي", "ذهبي", "بيج"];

export default function InventoryFormSimple({ open, onOpenChange, editItem }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedManufacturer, setSelectedManufacturer] = useState(editItem?.manufacturer || "");
  const [availableCategories, setAvailableCategories] = useState<string[]>(
    editItem?.manufacturer ? manufacturerCategories[editItem.manufacturer] || [] : []
  );
  
  // Local state for editable lists
  const [manufacturers, setManufacturers] = useState<string[]>(initialManufacturers);
  const [engineCapacities, setEngineCapacities] = useState<string[]>(initialEngineCapacities);
  const [statuses, setStatuses] = useState<string[]>(initialStatuses);
  const [importTypes, setImportTypes] = useState<string[]>(initialImportTypes);
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const [exteriorColors, setExteriorColors] = useState<string[]>(initialColors);
  const [interiorColors, setInteriorColors] = useState<string[]>(initialColors);
  
  // List manager state
  const [showListManager, setShowListManager] = useState(false);
  
  // Manufacturer categories state
  const [localManufacturerCategories, setLocalManufacturerCategories] = useState<Record<string, string[]>>(manufacturerCategories);
  
  // Chassis number scanner state
  const [showChassisScanner, setShowChassisScanner] = useState(false);

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: editItem || {
      manufacturer: "",
      category: "",
      engineCapacity: "",
      year: new Date().getFullYear(),
      exteriorColor: "",
      interiorColor: "",
      status: "متوفر",
      importType: "شخصي",
      location: "المستودع الرئيسي",
      chassisNumber: "",
      price: "",
      images: [],
      notes: "",
      isSold: false,
    },
  });

  const handleManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
    setAvailableCategories(localManufacturerCategories[manufacturer] || []);
    form.setValue("category", "");
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم الإنشاء",
        description: "تم إضافة العنصر بنجاح",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة العنصر",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => 
      apiRequest("PUT", `/api/inventory/${editItem?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث العنصر بنجاح",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث العنصر",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventoryItem) => {
    if (editItem) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Handle chassis number extraction from image
  const handleChassisNumberExtracted = (chassisNumber: string) => {
    form.setValue("chassisNumber", chassisNumber);
    toast({
      title: "تم استخراج رقم الهيكل",
      description: `رقم الهيكل: ${chassisNumber}`,
    });
  };

  const getOptionsForType = (type: string) => {
    switch (type) {
      case "manufacturers": return manufacturers;
      case "engineCapacities": return engineCapacities;
      case "statuses": return statuses;
      case "importTypes": return importTypes;
      case "locations": return locations;
      case "exteriorColors": return exteriorColors;
      case "interiorColors": return interiorColors;
      default: return [];
    }
  };

  const setOptionsForType = (type: string, newList: string[] | Record<string, string[]>) => {
    switch (type) {
      case "manufacturers": 
        setManufacturers(newList as string[]); 
        break;
      case "manufacturerCategories": 
        setLocalManufacturerCategories(newList as Record<string, string[]>); 
        break;
      case "engineCapacities": 
        setEngineCapacities(newList as string[]); 
        break;
      case "statuses": 
        setStatuses(newList as string[]); 
        break;
      case "importTypes": 
        setImportTypes(newList as string[]); 
        break;
      case "locations": 
        setLocations(newList as string[]); 
        break;
      case "exteriorColors": 
        setExteriorColors(newList as string[]); 
        break;
      case "interiorColors": 
        setInteriorColors(newList as string[]); 
        break;
    }
  };

  const getOptionTitle = (type: string) => {
    const titles: Record<string, string> = {
      manufacturers: "الشركات المصنعة",
      engineCapacities: "سعات المحرك",
      statuses: "حالات المركبة",
      importTypes: "أنواع الاستيراد",
      locations: "المواقع",
      exteriorColors: "الألوان الخارجية",
      interiorColors: "الألوان الداخلية"
    };
    return titles[type] || "";
  };

  // Load edit item data when editItem changes
  useEffect(() => {
    if (editItem && open) {
      // Set form values from editItem
      form.reset({
        manufacturer: editItem.manufacturer,
        category: editItem.category,
        engineCapacity: editItem.engineCapacity,
        year: editItem.year,
        exteriorColor: editItem.exteriorColor,
        interiorColor: editItem.interiorColor,
        status: editItem.status,
        importType: editItem.importType,
        location: editItem.location,
        chassisNumber: editItem.chassisNumber,
        price: editItem.price || "",
        images: editItem.images || [],
        notes: editItem.notes || "",
        isSold: editItem.isSold || false,
      });

      // Set manufacturer and available categories
      setSelectedManufacturer(editItem.manufacturer);
      setAvailableCategories(localManufacturerCategories[editItem.manufacturer] || []);
    } else if (!editItem && open) {
      // Reset form for new item
      form.reset({
        manufacturer: "",
        category: "",
        engineCapacity: "",
        year: new Date().getFullYear(),
        exteriorColor: "",
        interiorColor: "",
        status: "متوفر",
        importType: "شخصي",
        location: "المستودع الرئيسي",
        chassisNumber: "",
        price: "",
        images: [],
        notes: "",
        isSold: false,
      });
      setSelectedManufacturer("");
      setAvailableCategories([]);
    }
  }, [editItem, open, form, localManufacturerCategories]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-slate-800">
                {editItem ? "تحرير العنصر" : "إضافة عنصر جديد"}
              </DialogTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowListManager(true)}
                className="text-xs"
              >
                <Settings className="h-4 w-4 ml-1" />
                تحرير القوائم
              </Button>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manufacturer Field */}
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الصانع</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={(value) => {
                          handleManufacturerChange(value);
                          field.onChange(value);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الصانع" />
                          </SelectTrigger>
                          <SelectContent>
                            {manufacturers.map((manufacturer) => (
                              <SelectItem key={manufacturer} value={manufacturer}>
                                {manufacturer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Field with Categories Manager */}
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفئة</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange} disabled={!selectedManufacturer}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Manufacturer Categories Management Button */}
                  {selectedManufacturer && (
                    <ManufacturerCategoriesButton
                      manufacturer={selectedManufacturer}
                      categories={localManufacturerCategories[selectedManufacturer] || []}
                      onCategoriesChange={(newCategories) => {
                        setLocalManufacturerCategories(prev => ({
                          ...prev,
                          [selectedManufacturer]: newCategories
                        }));
                        setAvailableCategories(newCategories);
                      }}
                    />
                  )}
                </div>

                {/* Engine Capacity */}
                <FormField
                  control={form.control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعة المحرك</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر سعة المحرك" />
                          </SelectTrigger>
                          <SelectContent>
                            {engineCapacities.map((capacity) => (
                              <SelectItem key={capacity} value={capacity}>
                                {capacity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السنة</FormLabel>
                      <FormControl>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر السنة" />
                          </SelectTrigger>
                          <SelectContent>
                            {initialYears.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Exterior Color */}
                <FormField
                  control={form.control}
                  name="exteriorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللون الخارجي</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر اللون الخارجي" />
                          </SelectTrigger>
                          <SelectContent>
                            {exteriorColors.map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interior Color */}
                <FormField
                  control={form.control}
                  name="interiorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللون الداخلي</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر اللون الداخلي" />
                          </SelectTrigger>
                          <SelectContent>
                            {interiorColors.map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Import Type */}
                <FormField
                  control={form.control}
                  name="importType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الاستيراد</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الاستيراد" />
                          </SelectTrigger>
                          <SelectContent>
                            {importTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموقع</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الموقع" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Chassis Number */}
                <FormField
                  control={form.control}
                  name="chassisNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهيكل</FormLabel>
                      <div className="flex gap-2">
                        <FormControl className="flex-1">
                          <Input placeholder="أدخل رقم الهيكل" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowChassisScanner(true)}
                          title="تصوير رقم الهيكل"
                        >
                          <Camera size={16} />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل السعر" 
                          type="number"
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? [e.target.value] : [])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>الملاحظات</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل الملاحظات هنا..."
                          className="min-h-[100px]"
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <CloudUpload className="h-4 w-4 ml-2" />
                  {isLoading ? "جاري الحفظ..." : editItem ? "تحديث" : "حفظ"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* List Manager Dialog */}
      <ListManagerSimple
        open={showListManager}
        onOpenChange={setShowListManager}
        listsData={{
          manufacturers,
          engineCapacities,
          statuses,
          importTypes,
          locations,
          exteriorColors,
          interiorColors,
        }}
        onSave={(type, newList) => setOptionsForType(type, newList as string[])}
      />

      {/* Chassis Number Scanner Dialog */}
      <ChassisNumberScanner
        open={showChassisScanner}
        onOpenChange={setShowChassisScanner}
        onChassisNumberExtracted={handleChassisNumberExtracted}
      />
    </>
  );
}