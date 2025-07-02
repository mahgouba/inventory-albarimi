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
import { CloudUpload } from "lucide-react";
import { Settings } from "lucide-react";
import OptionsEditor from "@/components/options-editor";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

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

const initialManufacturers = Object.keys(manufacturerCategories);
const initialEngineCapacities = ["2.0L", "1.5L", "3.0L", "4.0L", "5.0L", "V6", "V8"];
const initialYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const initialStatuses = ["متوفر", "في الطريق", "قيد الصيانة"];
const initialImportTypes = ["شخصي", "شركة", "مستعمل شخصي"];
const initialLocations = ["المستودع الرئيسي", "المعرض", "الورشة", "الميناء", "مستودع فرعي"];
const initialColors = ["أسود", "أبيض", "رمادي", "أزرق", "أحمر", "بني", "فضي", "ذهبي", "بيج"];

export default function InventoryForm({ open, onOpenChange, editItem }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedManufacturer, setSelectedManufacturer] = useState(editItem?.manufacturer || "");
  const [availableCategories, setAvailableCategories] = useState<string[]>(
    editItem?.manufacturer ? manufacturerCategories[editItem.manufacturer] || [] : []
  );
  const [isEditingOptions, setIsEditingOptions] = useState(false);
  
  // Local state for editable lists
  const [editableManufacturers, setEditableManufacturers] = useState<string[]>(initialManufacturers);
  const [editableEngineCapacities, setEditableEngineCapacities] = useState<string[]>(initialEngineCapacities);
  const [editableStatuses, setEditableStatuses] = useState<string[]>(initialStatuses);
  const [editableImportTypes, setEditableImportTypes] = useState<string[]>(initialImportTypes);
  const [editableLocations, setEditableLocations] = useState<string[]>(initialLocations);
  const [editableExteriorColors, setEditableExteriorColors] = useState<string[]>(initialColors);
  const [editableInteriorColors, setEditableInteriorColors] = useState<string[]>(initialColors);
  
  // Options editor state
  const [editingOptionType, setEditingOptionType] = useState<string | null>(null);

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: editItem || {
      manufacturer: "",
      category: "",
      engineCapacity: "",
      year: new Date().getFullYear(),
      exteriorColor: "",
      interiorColor: "",
      status: "",
      importType: "",
      location: "",
      chassisNumber: "",
      images: [],
      logo: "",
      notes: "",
      isSold: false,
    },
  });

  // Handle manufacturer change
  const handleManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
    setAvailableCategories(manufacturerCategories[manufacturer] || []);
    
    // Reset category when manufacturer changes
    form.setValue("manufacturer", manufacturer);
    form.setValue("category", "");
  };

  // Update form when editItem changes
  useEffect(() => {
    if (editItem) {
      form.reset(editItem);
      setSelectedManufacturer(editItem.manufacturer);
      setAvailableCategories(manufacturerCategories[editItem.manufacturer] || []);
    }
  }, [editItem, form]);

  const createMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "تم بنجاح",
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
      apiRequest("PATCH", `/api/inventory/${editItem?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "تم بنجاح",
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

  return (
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
              onClick={() => setIsEditingOptions(!isEditingOptions)}
              className="text-xs"
            >
              <Settings className="h-4 w-4 ml-1" />
              {isEditingOptions ? "حفظ التعديلات" : "تحرير القوائم"}
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manufacturer Field - First */}
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصانع</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={manufacturers}
                        value={field.value}
                        onValueChange={(value) => {
                          handleManufacturerChange(value);
                          field.onChange(value);
                        }}
                        onAddOption={(newManufacturer) => {
                          setManufacturers([...manufacturers, newManufacturer]);
                        }}
                        onDeleteOption={(deletedManufacturer) => {
                          setManufacturers(manufacturers.filter(m => m !== deletedManufacturer));
                        }}
                        onEditOption={(oldManufacturer, newManufacturer) => {
                          setManufacturers(manufacturers.map(m => m === oldManufacturer ? newManufacturer : m));
                        }}
                        placeholder="اختر الصانع"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.length > 0 ? (
                            availableCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="no-manufacturer">
                              يرجى اختيار الصانع أولاً
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سعة المحرك</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={engineCapacities}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newCapacity) => {
                          setEngineCapacities([...engineCapacities, newCapacity]);
                        }}
                        placeholder="اختر سعة المحرك"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السنة</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} 
                              defaultValue={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر السنة" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
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

              <FormField
                control={form.control}
                name="exteriorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون الخارجي</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={exteriorColors}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newColor) => {
                          setExteriorColors([...exteriorColors, newColor]);
                        }}
                        placeholder="اختر اللون الخارجي"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interiorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون الداخلي</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={interiorColors}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newColor) => {
                          setInteriorColors([...interiorColors, newColor]);
                        }}
                        placeholder="اختر اللون الداخلي"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاستيراد</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={importTypes}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newType) => {
                          setImportTypes([...importTypes, newType]);
                        }}
                        placeholder="اختر نوع الاستيراد"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموقع</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={locations}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newLocation) => {
                          setLocations([...locations, newLocation]);
                        }}
                        placeholder="اختر الموقع"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={statuses}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newStatus) => {
                          setStatuses([...statuses, newStatus]);
                        }}
                        placeholder="اختر الحالة"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهيكل</FormLabel>
                    <FormControl>
                      <Input placeholder="WASSBER0000000" className="font-latin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر (ريال سعودي)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="150000" 
                        type="number"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
                {isLoading ? "جاري الحفظ..." : editItem ? "تحديث العنصر" : "حفظ العنصر"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
