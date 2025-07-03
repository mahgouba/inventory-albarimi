import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Upload, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LogoUpload from "@/components/logo-upload";

interface Manufacturer {
  id: number;
  name: string;
  logo: string | null;
  createdAt: Date | null;
}

interface ManufacturerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editManufacturer?: Manufacturer;
}

function ManufacturerForm({ open, onOpenChange, editManufacturer }: ManufacturerFormProps) {
  const [name, setName] = useState(editManufacturer?.name || "");
  const [logo, setLogo] = useState(editManufacturer?.logo || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: { name: string; logo?: string }) => 
      apiRequest("POST", "/api/manufacturers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      toast({ title: "تم إنشاء الشركة المصنعة بنجاح" });
      onOpenChange(false);
      setName("");
      setLogo("");
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء الشركة المصنعة", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; logo?: string }) => 
      apiRequest("PUT", `/api/manufacturers/${editManufacturer?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      toast({ title: "تم تحديث الشركة المصنعة بنجاح" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "خطأ في تحديث الشركة المصنعة", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name: name.trim(), logo: logo || undefined };
    
    if (editManufacturer) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editManufacturer ? "تعديل الشركة المصنعة" : "إضافة شركة مصنعة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الشركة المصنعة</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مرسيدس"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>شعار الشركة المصنعة</Label>
            <div className="border rounded-lg p-4 bg-slate-50">
              <LogoUpload
                value={logo}
                onChange={setLogo}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editManufacturer ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ManufacturersPageProps {
  userRole: string;
}

export default function ManufacturersPage({ userRole }: ManufacturersPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editManufacturer, setEditManufacturer] = useState<Manufacturer | undefined>();
  const { toast } = useToast();

  const { data: manufacturers = [], isLoading } = useQuery({
    queryKey: ["/api/manufacturers"],
  });

  const handleEdit = (manufacturer: Manufacturer) => {
    setEditManufacturer(manufacturer);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditManufacturer(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الشركات المصنعة</h1>
        {userRole === "admin" && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة شركة مصنعة
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {manufacturers.map((manufacturer: Manufacturer) => (
          <Card key={manufacturer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{manufacturer.name}</CardTitle>
                {userRole === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(manufacturer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg mb-4">
                {manufacturer.logo ? (
                  <img
                    src={manufacturer.logo}
                    alt={`${manufacturer.name} logo`}
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-sm text-center">
                    <Upload className="h-8 w-8 mx-auto mb-1" />
                    لا يوجد لوجو
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center">
                {manufacturer.logo ? (
                  <Badge variant="secondary" className="text-green-600">
                    <Check className="h-3 w-3 ml-1" />
                    يوجد لوجو
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    بحاجة للوجو
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ManufacturerForm
        open={showForm}
        onOpenChange={handleCloseForm}
        editManufacturer={editManufacturer}
      />
    </div>
  );
}