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

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

const categories = ["لاتوبيغرافي", "أوتوماتيكي", "يدوي"];
const engineCapacities = ["V6", "V8", "V10", "V12", "4 سلندر", "6 سلندر", "8 سلندر"];
const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const statuses = ["متوفر", "في الطريق", "قيد الصيانة"];
const importTypes = ["شخصي", "شركة", "مستعمل شخصي"];
const manufacturers = ["مرسيدس", "لاند روفر", "بي ام دبليو", "أودي", "تويوتا", "نيسان", "هوندا", "فورد", "هيونداي"];
const colors = ["أسود", "أبيض", "رمادي", "أزرق", "أحمر", "بني", "فضي", "ذهبي"];

export default function InventoryForm({ open, onOpenChange, editItem }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: editItem || {
      category: "",
      engineCapacity: "",
      year: new Date().getFullYear(),
      exteriorColor: "",
      interiorColor: "",
      status: "",
      importType: "",
      manufacturer: "",
      chassisNumber: "",
      images: [],
      notes: "",
      isSold: false,
    },
  });

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

  // Pre-populate form when editing
  useEffect(() => {
    if (editItem && open) {
      form.reset({
        category: editItem.category || "",
        engineCapacity: editItem.engineCapacity || "",
        year: editItem.year || 2024,
        exteriorColor: editItem.exteriorColor || "",
        interiorColor: editItem.interiorColor || "",
        status: editItem.status || "",
        importType: editItem.importType || "",
        manufacturer: editItem.manufacturer || "",
        chassisNumber: editItem.chassisNumber || "",
        images: editItem.images || [],
        notes: editItem.notes || "",
        isSold: editItem.isSold || false,
      });
    } else if (!editItem && open) {
      form.reset({
        category: "",
        engineCapacity: "",
        year: 2024,
        exteriorColor: "",
        interiorColor: "",
        status: "",
        importType: "",
        manufacturer: "",
        chassisNumber: "",
        images: [],
        notes: "",
        isSold: false,
      });
    }
  }, [editItem, open, form]);

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
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {editItem ? "تحرير العنصر" : "إضافة عنصر جديد"}
          </DialogTitle>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
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

              <FormField
                control={form.control}
                name="engineCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سعة المحرك</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصانع</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر اللون الخارجي" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
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

              <FormField
                control={form.control}
                name="interiorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون الداخلي</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر اللون الداخلي" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
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

              <FormField
                control={form.control}
                name="importType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاستيراد</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصانع</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
