import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Upload, Check, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LogoUpload from "@/components/logo-upload";
import { Link } from "wouter";

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
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">شعار الشركة المصنعة</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600 mb-1">اسحب الشعار هنا أو انقر للاختيار</p>
                <p className="text-xs text-slate-500">يُنصح بحجم 200×200 بكسل، PNG أو JPG</p>
              </div>
              <LogoUpload
                value={logo}
                onChange={setLogo}
                className="w-full"
              />
            </div>
            {logo && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                <span>تم رفع الشعار بنجاح</span>
              </div>
            )}
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
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800 hover:bg-slate-50">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الشركات المصنعة</h1>
          <p className="text-slate-600">أضف وعدل الشركات المصنعة مع شعاراتها لتظهر في عرض البطاقات</p>
        </div>
        {userRole === "admin" && (
          <Button onClick={() => setShowForm(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 ml-2" />
            إضافة شركة مصنعة
          </Button>
        )}
      </div>

      {/* Instructions Card */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">كيفية إضافة شعارات الشركات المصنعة</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• انقر على "إضافة شركة مصنعة" لإنشاء شركة جديدة</li>
                <li>• اكتب اسم الشركة المصنعة (مثل: مرسيدس، بي ام دبليو)</li>
                <li>• ارفع شعار الشركة بصيغة PNG أو JPG</li>
                <li>• الشعارات ستظهر تلقائياً في عرض البطاقات والتقارير</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div className="flex items-center justify-center h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg mb-4 border-2 border-dashed border-slate-200">
                {manufacturer.logo ? (
                  <img
                    src={manufacturer.logo}
                    alt={`${manufacturer.name} logo`}
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-sm text-center p-4">
                    <div className="bg-slate-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="font-medium mb-1">لا يوجد شعار</p>
                    <p className="text-xs text-slate-500">انقر على تحرير لإضافة شعار</p>
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