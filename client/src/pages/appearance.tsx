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
  Moon,
  Image as ImageIcon,
  Check,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Manufacturer, AppearanceSettings } from "@shared/schema";

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

  // Fetch current appearance settings
  const { data: appearanceSettings } = useQuery<AppearanceSettings>({
    queryKey: ["/api/appearance"],
    onSuccess: (data) => {
      if (data) {
        setCompanyName(data.companyName || "إدارة المخزون");
        setCompanyNameEn(data.companyNameEn || "Inventory System");
        setCompanyLogo(data.companyLogo);
        setPrimaryColor(data.primaryColor || "#0f766e");
        setSecondaryColor(data.secondaryColor || "#0891b2");
        setAccentColor(data.accentColor || "#BF9231");
        setDarkMode(data.darkMode || false);
        setRtlLayout(data.rtlLayout !== false);
      }
    }
  });

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

  // Apply theme changes to current page
  const applyThemeChanges = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--secondary', secondaryColor);
    root.style.setProperty('--accent', accentColor);
    
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    document.dir = rtlLayout ? 'rtl' : 'ltr';
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">اللون الأساسي</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        id="primaryColor"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
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
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
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
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon size={20} />
                  شعارات الشركات المصنعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {manufacturers.map((manufacturer) => (
                    <div key={manufacturer.id} className="border rounded-lg p-4 space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{manufacturer.name}</h3>
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
      </div>
    </div>
  );
}