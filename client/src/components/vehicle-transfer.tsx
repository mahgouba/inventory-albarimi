import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { InventoryItem, Location } from "@shared/schema";

const transferSchema = z.object({
  newLocation: z.string().min(1, "يجب اختيار الموقع الجديد"),
  reason: z.string().optional(),
  transferredBy: z.string().optional(),
  notes: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface VehicleTransferProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: InventoryItem | null;
}

export default function VehicleTransfer({ open, onOpenChange, vehicle }: VehicleTransferProps) {
  const { toast } = useToast();

  // Fetch locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Form setup
  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      newLocation: "",
      reason: "",
      transferredBy: "",
      notes: "",
    },
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: (data: TransferFormData) => {
      if (!vehicle) throw new Error("No vehicle selected");
      return apiRequest("POST", `/api/inventory/${vehicle.id}/transfer`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/location-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/location-stats"] });
      toast({ title: "تم نقل المركبة بنجاح" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "خطأ في نقل المركبة", variant: "destructive" });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    transferMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  // Filter out current location from options
  const availableLocations = locations.filter(
    (location) => location.name !== vehicle?.location && location.isActive
  );

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 space-x-reverse">
            <Truck className="h-5 w-5" />
            <span>نقل المركبة</span>
          </DialogTitle>
        </DialogHeader>

        {/* Vehicle Info */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                {vehicle.manufacturer} {vehicle.category}
              </h3>
              <Badge variant="secondary">{vehicle.status}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div>
                <span className="font-medium">سعة المحرك:</span> {vehicle.engineCapacity}
              </div>
              <div>
                <span className="font-medium">السنة:</span> {vehicle.year}
              </div>
              <div>
                <span className="font-medium">اللون:</span> {vehicle.exteriorColor}
              </div>
              <div>
                <span className="font-medium">رقم الهيكل:</span> 
                <span className="font-latin text-xs">{vehicle.chassisNumber}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse pt-2 border-t border-slate-200">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">الموقع الحالي:</span>
              <span className="font-medium text-slate-800">{vehicle.location}</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموقع الجديد</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع الجديد" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableLocations.map((location) => (
                        <SelectItem key={location.id} value={location.name}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <MapPin className="h-4 w-4" />
                            <span>{location.name}</span>
                            {location.description && (
                              <span className="text-sm text-slate-500">
                                - {location.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب النقل</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب النقل" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="تنظيم المخزون">تنظيم المخزون</SelectItem>
                      <SelectItem value="طلب عميل">طلب عميل</SelectItem>
                      <SelectItem value="صيانة">صيانة</SelectItem>
                      <SelectItem value="عرض">عرض</SelectItem>
                      <SelectItem value="تسليم">تسليم</SelectItem>
                      <SelectItem value="إعادة توزيع">إعادة توزيع</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transferredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نقل بواسطة</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الموظف المسؤول" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="ملاحظات إضافية حول النقل" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transfer Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 space-x-reverse text-blue-700">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">تاريخ النقل:</span>
                <span className="text-sm">
                  {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={transferMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {transferMutation.isPending ? (
                  <>
                    <Truck className="h-4 w-4 mr-2 animate-pulse" />
                    جاري النقل...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-2" />
                    تأكيد النقل
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}