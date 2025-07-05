import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, 
  Upload, 
  Save, 
  ArrowLeft,
  Settings,
  Sun,
  Moon,
  Building,
  Image as ImageIcon,
  Edit2,
  Plus,
  Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { AppearanceSettings, Manufacturer } from "@/../../shared/schema";
import { apiRequest } from "@/lib/queryClient";

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

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
  onLogout: () => void;
}

export default function AppearancePage({ userRole, onLogout }: AppearancePageProps) {
  // State variables for all color customization
  const [companyName, setCompanyName] = useState("إدارة المخزون");
  const [companyNameEn, setCompanyNameEn] = useState("Inventory System");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  // Light mode colors
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [primaryHoverColor, setPrimaryHoverColor] = useState("#134e4a");
  const [secondaryColor, setSecondaryColor] = useState("#0891b2");
  const [secondaryHoverColor, setSecondaryHoverColor] = useState("#0c4a6e");
  const [accentColor, setAccentColor] = useState("#BF9231");
  const [accentHoverColor, setAccentHoverColor] = useState("#a67c27");
  const [gradientStart, setGradientStart] = useState("#0f766e");
  const [gradientEnd, setGradientEnd] = useState("#0891b2");
  const [cardBackgroundColor, setCardBackgroundColor] = useState("#ffffff");
  const [cardHoverColor, setCardHoverColor] = useState("#f8fafc");
  const [borderColor, setBorderColor] = useState("#e2e8f0");
  const [borderHoverColor, setBorderHoverColor] = useState("#0f766e");
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [textPrimaryColor, setTextPrimaryColor] = useState("#1e293b");
  const [textSecondaryColor, setTextSecondaryColor] = useState("#64748b");
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState("#ffffff");
  
  // Dark mode colors
  const [darkBackgroundColor, setDarkBackgroundColor] = useState("#000000");
  const [darkPrimaryColor, setDarkPrimaryColor] = useState("#14b8a6");
  const [darkPrimaryHoverColor, setDarkPrimaryHoverColor] = useState("#0d9488");
  const [darkSecondaryColor, setDarkSecondaryColor] = useState("#0ea5e9");
  const [darkSecondaryHoverColor, setDarkSecondaryHoverColor] = useState("#0284c7");
  const [darkAccentColor, setDarkAccentColor] = useState("#f59e0b");
  const [darkAccentHoverColor, setDarkAccentHoverColor] = useState("#d97706");
  const [darkCardBackgroundColor, setDarkCardBackgroundColor] = useState("#141414");
  const [darkCardHoverColor, setDarkCardHoverColor] = useState("#282828");
  const [darkBorderColor, setDarkBorderColor] = useState("#374151");
  const [darkBorderHoverColor, setDarkBorderHoverColor] = useState("#14b8a6");
  const [darkTextPrimaryColor, setDarkTextPrimaryColor] = useState("#f1f5f9");
  const [darkTextSecondaryColor, setDarkTextSecondaryColor] = useState("#94a3b8");
  const [darkHeaderBackgroundColor, setDarkHeaderBackgroundColor] = useState("#141414");
  
  const [darkMode, setDarkMode] = useState(false);
  const [rtlLayout, setRtlLayout] = useState(true);
  
  // State for new manufacturer dialog
  const [showNewManufacturerDialog, setShowNewManufacturerDialog] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [newManufacturerLogo, setNewManufacturerLogo] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch current appearance settings
  const { data: appearanceSettings } = useQuery<AppearanceSettings>({
    queryKey: ["/api/appearance"],
  });

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });

  // Save appearance settings mutation
  const saveAppearanceMutation = useMutation({
    mutationFn: async (settings: Partial<AppearanceSettings>) => {
      const response = await fetch("/api/appearance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error("Failed to save appearance settings");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم تطبيق إعدادات المظهر الجديدة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appearance"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: "حدث خطأ أثناء حفظ إعدادات المظهر",
        variant: "destructive",
      });
    },
  });

  // Create new manufacturer mutation
  const createManufacturerMutation = useMutation({
    mutationFn: async (manufacturer: { name: string; logo?: string }) => {
      const response = await fetch("/api/manufacturers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(manufacturer),
      });
      if (!response.ok) {
        throw new Error("Failed to create manufacturer");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الشركة المصنعة بنجاح",
        description: "تم إضافة شركة مصنعة جديدة إلى القائمة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setShowNewManufacturerDialog(false);
      setNewManufacturerName("");
      setNewManufacturerLogo(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة الشركة المصنعة",
        description: "حدث خطأ أثناء إضافة الشركة المصنعة",
        variant: "destructive",
      });
    },
  });

  // Update manufacturer logo mutation
  const updateManufacturerLogoMutation = useMutation({
    mutationFn: async ({ id, logo }: { id: number; logo: string }) => {
      const response = await fetch(`/api/manufacturers/${id}/logo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logo }),
      });
      if (!response.ok) {
        throw new Error("Failed to update manufacturer logo");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الشعار بنجاح",
        description: "تم تحديث شعار الشركة المصنعة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث الشعار",
        description: "حدث خطأ أثناء تحديث الشعار",
        variant: "destructive",
      });
    },
  });

  // Update state when data is fetched
  useEffect(() => {
    if (appearanceSettings) {
      setCompanyName(appearanceSettings.companyName || "إدارة المخزون");
      setCompanyNameEn(appearanceSettings.companyNameEn || "Inventory System");
      setCompanyLogo(appearanceSettings.companyLogo);
      
      // Light mode colors
      setPrimaryColor(appearanceSettings.primaryColor || "#0f766e");
      setPrimaryHoverColor(appearanceSettings.primaryHoverColor || "#134e4a");
      setSecondaryColor(appearanceSettings.secondaryColor || "#0891b2");
      setSecondaryHoverColor(appearanceSettings.secondaryHoverColor || "#0c4a6e");
      setAccentColor(appearanceSettings.accentColor || "#BF9231");
      setAccentHoverColor(appearanceSettings.accentHoverColor || "#a67c27");
      setGradientStart(appearanceSettings.gradientStart || "#0f766e");
      setGradientEnd(appearanceSettings.gradientEnd || "#0891b2");
      setCardBackgroundColor(appearanceSettings.cardBackgroundColor || "#ffffff");
      setCardHoverColor(appearanceSettings.cardHoverColor || "#f8fafc");
      setBorderColor(appearanceSettings.borderColor || "#e2e8f0");
      setBorderHoverColor(appearanceSettings.borderHoverColor || "#0f766e");
      setBackgroundColor(appearanceSettings.backgroundColor || "#f8fafc");
      setTextPrimaryColor(appearanceSettings.textPrimaryColor || "#1e293b");
      setTextSecondaryColor(appearanceSettings.textSecondaryColor || "#64748b");
      setHeaderBackgroundColor(appearanceSettings.headerBackgroundColor || "#ffffff");
      
      // Dark mode colors
      setDarkBackgroundColor(appearanceSettings.darkBackgroundColor || "#000000");
      setDarkPrimaryColor(appearanceSettings.darkPrimaryColor || "#14b8a6");
      setDarkPrimaryHoverColor(appearanceSettings.darkPrimaryHoverColor || "#0d9488");
      setDarkSecondaryColor(appearanceSettings.darkSecondaryColor || "#0ea5e9");
      setDarkSecondaryHoverColor(appearanceSettings.darkSecondaryHoverColor || "#0284c7");
      setDarkAccentColor(appearanceSettings.darkAccentColor || "#f59e0b");
      setDarkAccentHoverColor(appearanceSettings.darkAccentHoverColor || "#d97706");
      setDarkCardBackgroundColor(appearanceSettings.darkCardBackgroundColor || "#141414");
      setDarkCardHoverColor(appearanceSettings.darkCardHoverColor || "#282828");
      setDarkBorderColor(appearanceSettings.darkBorderColor || "#374151");
      setDarkBorderHoverColor(appearanceSettings.darkBorderHoverColor || "#14b8a6");
      setDarkTextPrimaryColor(appearanceSettings.darkTextPrimaryColor || "#f1f5f9");
      setDarkTextSecondaryColor(appearanceSettings.darkTextSecondaryColor || "#94a3b8");
      setDarkHeaderBackgroundColor(appearanceSettings.darkHeaderBackgroundColor || "#141414");
      
      setDarkMode(appearanceSettings.darkMode || false);
      setRtlLayout(appearanceSettings.rtlLayout !== false);
    }
  }, [appearanceSettings]);

  // Function to save all appearance settings
  const handleSaveSettings = () => {
    const settings = {
      companyName,
      companyNameEn,
      companyLogo,
      primaryColor,
      primaryHoverColor,
      secondaryColor,
      secondaryHoverColor,
      accentColor,
      accentHoverColor,
      gradientStart,
      gradientEnd,
      cardBackgroundColor,
      cardHoverColor,
      borderColor,
      borderHoverColor,
      backgroundColor,
      textPrimaryColor,
      textSecondaryColor,
      headerBackgroundColor,
      darkBackgroundColor,
      darkPrimaryColor,
      darkPrimaryHoverColor,
      darkSecondaryColor,
      darkSecondaryHoverColor,
      darkAccentColor,
      darkAccentHoverColor,
      darkCardBackgroundColor,
      darkCardHoverColor,
      darkBorderColor,
      darkBorderHoverColor,
      darkTextPrimaryColor,
      darkTextSecondaryColor,
      darkHeaderBackgroundColor,
      darkMode,
      rtlLayout,
    };
    saveAppearanceMutation.mutate(settings);
  };

  // Function to add new manufacturer
  const handleAddManufacturer = () => {
    if (newManufacturerName.trim()) {
      createManufacturerMutation.mutate({
        name: newManufacturerName.trim(),
        logo: newManufacturerLogo || undefined,
      });
    }
  };

  // Function to apply colors immediately for preview
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply CSS variables for real-time preview
    if (darkMode) {
      root.style.setProperty('--primary', hexToHsl(darkPrimaryColor));
      root.style.setProperty('--primary-hover', hexToHsl(darkPrimaryHoverColor));
      root.style.setProperty('--secondary', hexToHsl(darkSecondaryColor));
      root.style.setProperty('--background', hexToHsl(darkBackgroundColor));
      root.style.setProperty('--card', hexToHsl(darkCardBackgroundColor));
      root.classList.add('dark');
    } else {
      root.style.setProperty('--primary', hexToHsl(primaryColor));
      root.style.setProperty('--primary-hover', hexToHsl(primaryHoverColor));
      root.style.setProperty('--secondary', hexToHsl(secondaryColor));
      root.style.setProperty('--background', hexToHsl(backgroundColor));
      root.style.setProperty('--card', hexToHsl(cardBackgroundColor));
      root.classList.remove('dark');
    }
  }, [darkMode, primaryColor, primaryHoverColor, secondaryColor, backgroundColor, cardBackgroundColor, darkPrimaryColor, darkPrimaryHoverColor, darkSecondaryColor, darkBackgroundColor, darkCardBackgroundColor]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300" dir="rtl">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft size={20} />
                العودة
              </Button>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة المظهر</h1>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <Button 
                onClick={handleSaveSettings} 
                disabled={saveAppearanceMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save size={16} />
                {saveAppearanceMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="branding">العلامة التجارية</TabsTrigger>
            <TabsTrigger value="light-colors">الألوان العادية</TabsTrigger>
            <TabsTrigger value="dark-colors">الألوان الليلية</TabsTrigger>
            <TabsTrigger value="logos">شعارات الشركات</TabsTrigger>
            <TabsTrigger value="layout">التخطيط</TabsTrigger>
          </TabsList>

          {/* Branding */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">اسم الشركة (بالعربية)</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyNameEn">اسم الشركة (بالإنجليزية)</Label>
                    <Input
                      id="companyNameEn"
                      value={companyNameEn}
                      onChange={(e) => setCompanyNameEn(e.target.value)}
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>شعار الشركة</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    {companyLogo ? (
                      <div className="space-y-4">
                        <img
                          src={companyLogo}
                          alt="Company Logo"
                          className="max-h-32 mx-auto"
                        />
                        <div className="flex items-center justify-center space-x-2 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCompanyLogo(null)}
                          >
                            حذف
                          </Button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setCompanyLogo(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button variant="outline" size="sm">
                              <Upload size={16} />
                              تغيير
                            </Button>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-lg mx-auto flex items-center justify-center">
                          <ImageIcon size={24} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-600 mb-2">اسحب صورة الشعار هنا أو</p>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setCompanyLogo(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button variant="outline">
                              <Upload size={16} />
                              اختر ملف
                            </Button>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Light Colors */}
          <TabsContent value="light-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun size={20} />
                  ألوان النظام العادي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">الألوان الأساسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>اللون الأساسي</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>اللون الثانوي</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">ألوان الخلفية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>خلفية الصفحة</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>خلفية البطاقات</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={cardBackgroundColor}
                          onChange={(e) => setCardBackgroundColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={cardBackgroundColor}
                          onChange={(e) => setCardBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dark Colors */}
          <TabsContent value="dark-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon size={20} />
                  ألوان النظام الليلي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">تفعيل النظام الليلي</Label>
                    <p className="text-sm text-muted-foreground">تشغيل النظام الليلي للصفحة الحالية</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                {/* Dark Primary Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">الألوان الأساسية الليلية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>اللون الأساسي الليلي</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={darkPrimaryColor}
                          onChange={(e) => setDarkPrimaryColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={darkPrimaryColor}
                          onChange={(e) => setDarkPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>خلفية الصفحة الليلية</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={darkBackgroundColor}
                          onChange={(e) => setDarkBackgroundColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={darkBackgroundColor}
                          onChange={(e) => setDarkBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logos */}
          <TabsContent value="logos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  شعارات الشركات المصنعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-slate-600">إدارة شعارات الشركات المصنعة في النظام</p>
                  <Button 
                    onClick={() => setShowNewManufacturerDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={16} />
                    إضافة شركة مصنعة
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {manufacturers.map((manufacturer) => (
                    <div key={manufacturer.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{manufacturer.name}</h3>
                        <Badge variant="outline">#{manufacturer.id}</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {manufacturer.logo ? (
                          <div className="space-y-2">
                            <img
                              src={manufacturer.logo}
                              alt={`${manufacturer.name} logo`}
                              className="w-16 h-16 object-contain mx-auto border rounded"
                            />
                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        updateManufacturerLogoMutation.mutate({
                                          id: manufacturer.id,
                                          logo: reader.result as string,
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <Button variant="outline" size="sm">
                                  <Edit2 size={14} />
                                  تغيير
                                </Button>
                              </label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  updateManufacturerLogoMutation.mutate({
                                    id: manufacturer.id,
                                    logo: "",
                                  });
                                }}
                              >
                                <Trash2 size={14} />
                                حذف
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center mx-auto">
                              <ImageIcon size={24} className="text-slate-400" />
                            </div>
                            <div className="text-center">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        updateManufacturerLogoMutation.mutate({
                                          id: manufacturer.id,
                                          logo: reader.result as string,
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <Button variant="outline" size="sm">
                                  <Upload size={14} />
                                  رفع شعار
                                </Button>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  إعدادات التخطيط
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">الاتجاه من اليمين إلى اليسار</Label>
                    <p className="text-sm text-muted-foreground">تخطيط النص والواجهة بالاتجاه العربي</p>
                  </div>
                  <Switch
                    checked={rtlLayout}
                    onCheckedChange={setRtlLayout}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Manufacturer Dialog */}
        <Dialog open={showNewManufacturerDialog} onOpenChange={setShowNewManufacturerDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة شركة مصنعة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturerName">اسم الشركة المصنعة</Label>
                <Input
                  id="manufacturerName"
                  value={newManufacturerName}
                  onChange={(e) => setNewManufacturerName(e.target.value)}
                  placeholder="مرسيدس"
                />
              </div>

              <div className="space-y-2">
                <Label>شعار الشركة (اختياري)</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                  {newManufacturerLogo ? (
                    <div className="space-y-2">
                      <img
                        src={newManufacturerLogo}
                        alt="Logo Preview"
                        className="max-h-16 mx-auto"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewManufacturerLogo(null)}
                      >
                        حذف الشعار
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-slate-200 rounded mx-auto flex items-center justify-center">
                        <ImageIcon size={20} className="text-slate-400" />
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setNewManufacturerLogo(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Button variant="outline" size="sm">
                          <Upload size={14} />
                          اختر شعار
                        </Button>
                      </label>
                    </div>
                  )}
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
                  onClick={handleAddManufacturer}
                  disabled={!newManufacturerName.trim() || createManufacturerMutation.isPending}
                >
                  {createManufacturerMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}