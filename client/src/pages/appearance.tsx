import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, 
  Upload, 
  Save, 
  Eye, 
  ArrowLeft,
  Settings,
  Monitor,
  Smartphone,
  Sun,
  Edit2,
  Moon,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Manufacturer, AppearanceSettings } from "@shared/schema";

// Function to convert hex color to HSL
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

interface AppearancePageProps {
  userRole: string;
}

export default function AppearancePage({ userRole }: AppearancePageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for appearance settings
  const [companyName, setCompanyName] = useState("إدارة المخزون");
  const [companyNameEn, setCompanyNameEn] = useState("Inventory System");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [secondaryColor, setSecondaryColor] = useState("#0891b2");
  const [accentColor, setAccentColor] = useState("#BF9231");
  const [darkMode, setDarkMode] = useState(false);
  const [rtlLayout, setRtlLayout] = useState(true);
  
  // State for new manufacturer dialog
  const [showNewManufacturerDialog, setShowNewManufacturerDialog] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [newManufacturerLogo, setNewManufacturerLogo] = useState<string | null>(null);
  
  // State for edit manufacturer dialog
  const [showEditManufacturerDialog, setShowEditManufacturerDialog] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<any>(null);
  const [editManufacturerName, setEditManufacturerName] = useState("");

  // Fetch current appearance settings
  const { data: appearanceSettings } = useQuery<AppearanceSettings>({
    queryKey: ["/api/appearance"],
  });

  // Update state when data is fetched
  useEffect(() => {
    if (appearanceSettings) {
      setCompanyName(appearanceSettings.companyName || "إدارة المخزون");
      setCompanyNameEn(appearanceSettings.companyNameEn || "Inventory System");
      setCompanyLogo(appearanceSettings.companyLogo);
      setPrimaryColor(appearanceSettings.primaryColor || "#0f766e");
      setSecondaryColor(appearanceSettings.secondaryColor || "#0891b2");
      setAccentColor(appearanceSettings.accentColor || "#BF9231");
      setDarkMode(appearanceSettings.darkMode || false);
      setRtlLayout(appearanceSettings.rtlLayout !== false);
    }
  }, [appearanceSettings]);

  // Apply theme changes when values change
  useEffect(() => {
    applyThemeChanges();
  }, [primaryColor, secondaryColor, accentColor, darkMode, rtlLayout, companyName]);

  // Fetch manufacturers for logo management
  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });

  // Save appearance settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (settings: Partial<AppearanceSettings>) => 
      apiRequest("PUT", "/api/appearance", settings),
    onSuccess: () => {
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إعدادات المظهر وستظهر على كامل النظام",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appearance"] });
      // Apply changes to current page immediately
      applyThemeChanges();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات المظهر",
        variant: "destructive",
      });
    }
  });

  // Update manufacturer logo mutation
  const updateLogoMutation = useMutation({
    mutationFn: ({ id, logo }: { id: number; logo: string }) =>
      apiRequest("PUT", `/api/manufacturers/${id}/logo`, { logo }),
    onSuccess: () => {
      toast({
        title: "تم الحفظ بنجاح", 
        description: "تم حفظ شعار الشركة المصنعة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ شعار الشركة المصنعة",
        variant: "destructive",
      });
    }
  });

  // Create new manufacturer mutation
  const createManufacturerMutation = useMutation({
    mutationFn: (data: { name: string; logo?: string | null }) => {
      console.log("Sending manufacturer data:", data);
      return apiRequest("POST", "/api/manufacturers", data);
    },
    onSuccess: () => {
      toast({
        title: "تم الإنشاء بنجاح",
        description: "تمت إضافة الشركة المصنعة الجديدة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setShowNewManufacturerDialog(false);
      setNewManufacturerName("");
      setNewManufacturerLogo(null);
    },
    onError: (error: any) => {
      console.error("Error creating manufacturer:", error);
      
      // Check if it's a duplicate name error
      if (error.message.includes("409")) {
        toast({
          title: "خطأ",
          description: "الشركة المصنعة موجودة بالفعل! يرجى اختيار اسم آخر",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ",
          description: "فشل في إنشاء الشركة المصنعة",
          variant: "destructive",
        });
      }
    }
  });

  // Edit manufacturer name mutation
  const editManufacturerMutation = useMutation({
    mutationFn: (data: { id: number; name: string }) => {
      console.log("Editing manufacturer:", data);
      return apiRequest("PUT", `/api/manufacturers/${data.id}`, { name: data.name });
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث اسم الشركة المصنعة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setShowEditManufacturerDialog(false);
      setEditingManufacturer(null);
      setEditManufacturerName("");
    },
    onError: (error: any) => {
      console.error("Error editing manufacturer:", error);
      
      // Check if it's a duplicate name error
      if (error.message.includes("409")) {
        toast({
          title: "خطأ",
          description: "الاسم موجود بالفعل! يرجى اختيار اسم آخر",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تحديث اسم الشركة المصنعة",
          variant: "destructive",
        });
      }
    }
  });

  // Handle new manufacturer logo upload
  const handleNewManufacturerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewManufacturerLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle create manufacturer
  const handleCreateManufacturer = () => {
    if (newManufacturerName.trim()) {
      createManufacturerMutation.mutate({
        name: newManufacturerName.trim(),
        logo: newManufacturerLogo
      });
    }
  };

  // Handle edit manufacturer name
  const handleEditManufacturer = (manufacturer: any) => {
    setEditingManufacturer(manufacturer);
    setEditManufacturerName(manufacturer.name);
    setShowEditManufacturerDialog(true);
  };

  // Handle save edited manufacturer name
  const handleSaveEditedManufacturer = () => {
    if (editingManufacturer && editManufacturerName.trim()) {
      editManufacturerMutation.mutate({
        id: editingManufacturer.id,
        name: editManufacturerName.trim()
      });
    }
  };

  // Function to convert hex color to HSL
  const hexToHsl = (hex: string): string => {
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  };

  // Apply theme changes to current page
  const applyThemeChanges = () => {
    const root = document.documentElement;
    
    // Apply colors using CSS variables
    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);
    const accentHsl = hexToHsl(accentColor);
    
    root.style.setProperty('--dynamic-primary', `hsl(${primaryHsl})`);
    root.style.setProperty('--dynamic-secondary', `hsl(${secondaryHsl})`);
    root.style.setProperty('--dynamic-accent', `hsl(${accentHsl})`);
    
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    if (rtlLayout) {
      root.setAttribute('dir', 'rtl');
      document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif";
    } else {
      root.setAttribute('dir', 'ltr');
      document.body.style.fontFamily = "'Inter', sans-serif";
    }

    // Update page title
    if (companyName) {
      document.title = companyName;
    }
  };

  // Handle file upload for company logo
  const handleCompanyLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for manufacturer logos
  const handleManufacturerLogoUpload = (manufacturerId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const logoData = reader.result as string;
        updateLogoMutation.mutate({ id: manufacturerId, logo: logoData });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save all settings
  const handleSaveSettings = () => {
    const settings = {
      companyName,
      companyNameEn,
      companyLogo,
      primaryColor,
      secondaryColor,
      accentColor,
      darkMode,
      rtlLayout
    };
    saveSettingsMutation.mutate(settings);
  };

  // Preview theme changes
  useEffect(() => {
    applyThemeChanges();
  }, [primaryColor, secondaryColor, accentColor, darkMode, rtlLayout]);

  return (
    <div className="bg-slate-50 min-h-screen" dir={rtlLayout ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  <ArrowLeft size={18} className="ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-bold text-slate-800">إدارة المظهر</h1>
            </div>
            
            <Button 
              onClick={handleSaveSettings}
              disabled={saveSettingsMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {saveSettingsMutation.isPending ? (
                "جاري الحفظ..."
              ) : (
                <>
                  <Save size={16} className="ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">العلامة التجارية</TabsTrigger>
            <TabsTrigger value="colors">الألوان</TabsTrigger>
            <TabsTrigger value="logos">شعارات الشركات</TabsTrigger>
            <TabsTrigger value="layout">التخطيط</TabsTrigger>
          </TabsList>

          {/* Company Branding */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  معلومات الشركة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">اسم الشركة (عربي)</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="إدارة المخزون"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyNameEn">اسم الشركة (إنجليزي)</Label>
                    <Input
                      id="companyNameEn"
                      value={companyNameEn}
                      onChange={(e) => setCompanyNameEn(e.target.value)}
                      placeholder="Inventory System"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>شعار الشركة</Label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    {companyLogo && (
                      <div className="w-20 h-20 border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img 
                          src={companyLogo} 
                          alt="شعار الشركة" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCompanyLogoUpload}
                        className="hidden"
                        id="companyLogoUpload"
                      />
                      <label htmlFor="companyLogoUpload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload size={16} className="ml-2" />
                            رفع شعار جديد
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Color Scheme */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} />
                  نظام الألوان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">النظام الليلي</Label>
                    <p className="text-sm text-muted-foreground">تفعيل النظام الليلي للموقع</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={(checked) => {
                      setDarkMode(checked);
                      // Apply dark mode immediately for preview
                      if (checked) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">اللون الأساسي</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        id="primaryColor"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          // Apply color immediately for preview
                          const hsl = hexToHsl(e.target.value);
                          document.documentElement.style.setProperty('--dynamic-primary', `hsl(${hsl})`);
                        }}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                            const hsl = hexToHsl(e.target.value);
                            document.documentElement.style.setProperty('--dynamic-primary', `hsl(${hsl})`);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value);
                          // Apply color immediately for preview
                          const hsl = hexToHsl(e.target.value);
                          document.documentElement.style.setProperty('--dynamic-secondary', `hsl(${hsl})`);
                        }}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value);
                          if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                            const hsl = hexToHsl(e.target.value);
                            document.documentElement.style.setProperty('--dynamic-secondary', `hsl(${hsl})`);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">لون التمييز</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        id="accentColor"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          // Apply color immediately for preview
                          const hsl = hexToHsl(e.target.value);
                          document.documentElement.style.setProperty('--dynamic-accent', `hsl(${hsl})`);
                        }}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                            const hsl = hexToHsl(e.target.value);
                            document.documentElement.style.setProperty('--dynamic-accent', `hsl(${hsl})`);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="space-y-4">
                  <Label>معاينة الألوان</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      أساسي
                    </div>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      ثانوي
                    </div>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: accentColor }}
                    >
                      تمييز
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manufacturer Logos */}
          <TabsContent value="logos" className="space-y-6">
            {/* Instructions Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">إدارة شعارات الشركات المصنعة</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• ارفع شعارات الشركات المصنعة لتظهر في عرض البطاقات</li>
                      <li>• الشعارات تظهر تلقائياً في القائمة المنسدلة للتصفية</li>
                      <li>• يمكن إضافة شركات جديدة باستخدام الزر أسفل</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon size={20} />
                  شعارات الشركات المصنعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add New Manufacturer Button */}
                <div className="mb-6">
                  <Dialog open={showNewManufacturerDialog} onOpenChange={setShowNewManufacturerDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-dashed border-2 h-20 text-slate-600">
                        <Plus size={20} className="ml-2" />
                        إضافة شركة مصنعة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>إضافة شركة مصنعة جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newManufacturerName">اسم الشركة المصنعة</Label>
                          <Input
                            id="newManufacturerName"
                            value={newManufacturerName}
                            onChange={(e) => setNewManufacturerName(e.target.value)}
                            placeholder="مرسيدس"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>الشعار (اختياري)</Label>
                          <div className="flex items-center space-x-4 space-x-reverse">
                            {newManufacturerLogo && (
                              <div className="w-16 h-16 border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                <img 
                                  src={newManufacturerLogo} 
                                  alt="شعار الشركة الجديدة" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            )}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewManufacturerLogoUpload}
                                className="hidden"
                                id="newManufacturerLogoUpload"
                              />
                              <label htmlFor="newManufacturerLogoUpload">
                                <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                  <span>
                                    <Upload size={16} className="ml-2" />
                                    رفع شعار
                                  </span>
                                </Button>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowNewManufacturerDialog(false);
                              setNewManufacturerName("");
                              setNewManufacturerLogo(null);
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button 
                            onClick={handleCreateManufacturer}
                            disabled={!newManufacturerName.trim() || createManufacturerMutation.isPending}
                          >
                            {createManufacturerMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {manufacturers.map((manufacturer) => (
                    <div key={manufacturer.id} className="border rounded-lg p-4 space-y-4">
                      <div className="text-center relative">
                        <h3 className="font-semibold text-lg">{manufacturer.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditManufacturer(manufacturer)}
                          className="absolute top-0 right-0 h-6 w-6 p-0"
                        >
                          <Edit2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-3">
                        {manufacturer.logo ? (
                          <div className="w-20 h-20 border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                            <img 
                              src={manufacturer.logo} 
                              alt={manufacturer.name} 
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleManufacturerLogoUpload(manufacturer.id, e)}
                            className="hidden"
                            id={`manufacturerLogo-${manufacturer.id}`}
                          />
                          <label htmlFor={`manufacturerLogo-${manufacturer.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="cursor-pointer" 
                              asChild
                              disabled={updateLogoMutation.isPending}
                            >
                              <span>
                                <Upload size={14} className="ml-2" />
                                {manufacturer.logo ? "تغيير" : "رفع"}
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Settings */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor size={20} />
                  إعدادات التخطيط
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">الوضع المظلم</Label>
                    <p className="text-sm text-slate-600">تفعيل الوضع المظلم للواجهة</p>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Sun size={16} className="text-slate-400" />
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                    <Moon size={16} className="text-slate-400" />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">اتجاه النص</Label>
                    <p className="text-sm text-slate-600">تخطيط من اليمين لليسار (RTL)</p>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm">LTR</span>
                    <Switch
                      checked={rtlLayout}
                      onCheckedChange={setRtlLayout}
                    />
                    <span className="text-sm">RTL</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <Label>معاينة التخطيط</Label>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="space-y-3">
                      <div className="h-8 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit Manufacturer Name Dialog */}
        <Dialog open={showEditManufacturerDialog} onOpenChange={setShowEditManufacturerDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل اسم الشركة المصنعة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editManufacturerName">اسم الشركة المصنعة</Label>
                <Input
                  id="editManufacturerName"
                  value={editManufacturerName}
                  onChange={(e) => setEditManufacturerName(e.target.value)}
                  placeholder="مرسيدس"
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditManufacturerDialog(false);
                    setEditingManufacturer(null);
                    setEditManufacturerName("");
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSaveEditedManufacturer}
                  disabled={!editManufacturerName.trim() || editManufacturerMutation.isPending}
                >
                  {editManufacturerMutation.isPending ? "جاري التحديث..." : "حفظ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}