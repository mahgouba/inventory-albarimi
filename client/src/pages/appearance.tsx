import { useState } from "react";
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
  RotateCcw, 
  Save, 
  Eye, 
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Sun,
  Moon,
  Settings,
  Home,
  BarChart3,
  FileText,
  Users,
  Bell,
  UserCircle,
  Table,
  LayoutGrid,
  ArrowLeft,
  LogOut,
  Shield,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import CategoryManager from "@/components/category-manager";

interface AppearancePageProps {
  userRole: string;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  success: string;
  warning: string;
  error: string;
}

interface LogoSettings {
  company: string | null;
  dashboard: string | null;
  manufacturers: Record<string, string>;
}

export default function AppearancePage({ userRole }: AppearancePageProps) {
  const { toast } = useToast();
  
  // حالة إدارة الألوان
  const [colorScheme, setColorScheme] = useState<ColorScheme>({
    primary: "#0f766e", // teal-700
    secondary: "#64748b", // slate-500
    accent: "#BF9231", // gold
    background: "#f8fafc", // slate-50
    surface: "#ffffff", // white
    text: "#1e293b", // slate-800
    success: "#059669", // emerald-600
    warning: "#d97706", // amber-600
    error: "#dc2626", // red-600
  });

  // حالة إدارة اللوجوهات
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    company: null,
    dashboard: null,
    manufacturers: {
      "مرسيدس": "",
      "بي ام دبليو": "",
      "رولز رويز": "",
      "بنتلي": "",
      "رنج روفر": "",
      "دفندر": "",
      "بورش": "",
      "لكزس": "",
      "لينكون": "",
      "شوفولية": "",
      "تويوتا": "",
      "تسلا": "",
      "لوسيد": ""
    }
  });

  // حالة إدارة الفئات
  const [manufacturerCategories, setManufacturerCategories] = useState<Record<string, string[]>>({
    "مرسيدس": ["E200", "C200", "C300", "S500", "GLC"],
    "بي ام دبليو": ["X5", "X3", "X1", "320i", "520i"],
    "رولز رويز": ["Ghost", "Phantom", "Cullinan"],
    "بنتلي": ["Continental", "Bentayga", "Mulsanne"],
    "رنج روفر": ["Sport", "Evoque", "Vogue", "Velar"],
    "دفندر": ["90", "110", "130"],
    "بورش": ["Cayenne", "Macan", "911", "Panamera"],
    "لكزس": ["LX570", "RX350", "ES350", "LS500"],
    "لينكون": ["Navigator", "Aviator", "Continental"],
    "شوفولية": ["Tahoe", "Suburban", "Camaro"],
    "تويوتا": ["Land Cruiser", "Prado", "Camry", "Corolla"],
    "تسلا": ["Model S", "Model 3", "Model X", "Model Y"],
    "لوسيد": ["Air Dream", "Air Touring", "Air Pure"]
  });

  // حالة إدارة الأيقونات
  const [iconSettings, setIconSettings] = useState({
    dashboard: "Home",
    inventory: "Package",
    manufacturers: "Building",
    reports: "BarChart3",
    settings: "Settings",
    users: "Users",
    notifications: "Bell",
    profile: "UserCircle"
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // الألوان المحددة مسبقاً
  const presetColors = {
    "الأزرق الكلاسيكي": {
      primary: "#1e40af",
      secondary: "#64748b",
      accent: "#3b82f6"
    },
    "الأخضر الزمردي": {
      primary: "#047857",
      secondary: "#6b7280",
      accent: "#10b981"
    },
    "البرتقالي الدافئ": {
      primary: "#ea580c",
      secondary: "#71717a",
      accent: "#f97316"
    },
    "البنفسجي الأنيق": {
      primary: "#7c3aed",
      secondary: "#64748b",
      accent: "#8b5cf6"
    },
    "الذهبي الفاخر": {
      primary: "#BF9231",
      secondary: "#00627F",
      accent: "#d97706"
    }
  };

  const handleColorChange = (colorKey: keyof ColorScheme, value: string) => {
    setColorScheme(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyPresetColors = (preset: typeof presetColors[keyof typeof presetColors]) => {
    setColorScheme(prev => ({
      ...prev,
      ...preset
    }));
    toast({
      title: "تم تطبيق الألوان",
      description: "تم تحديث نظام الألوان بنجاح",
    });
  };

  const handleLogoUpload = (type: 'company' | 'dashboard' | string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'company' || type === 'dashboard') {
          setLogoSettings(prev => ({
            ...prev,
            [type]: result
          }));
        } else {
          setLogoSettings(prev => ({
            ...prev,
            manufacturers: {
              ...prev.manufacturers,
              [type]: result
            }
          }));
        }
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "تم رفع اللوجو",
        description: "تم حفظ اللوجو الجديد بنجاح",
      });
    }
  };

  const resetToDefault = () => {
    setColorScheme({
      primary: "#0f766e",
      secondary: "#64748b", 
      accent: "#BF9231",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#1e293b",
      success: "#059669",
      warning: "#d97706",
      error: "#dc2626",
    });
    
    toast({
      title: "تم الإعادة للافتراضي",
      description: "تم استعادة الإعدادات الافتراضية",
    });
  };

  const saveSettings = () => {
    // هنا يمكن حفظ الإعدادات في قاعدة البيانات
    toast({
      title: "تم الحفظ",
      description: "تم حفظ جميع إعدادات المظهر بنجاح",
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  الصفحة الرئيسية
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">إدارة المظهر</h1>
                <p className="text-slate-600">تخصيص الألوان والأيقونات واللوجوهات</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <Button variant="outline" onClick={resetToDefault}>
                <RotateCcw className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </Button>
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                    <UserCircle className="h-5 w-5 ml-2" />
                    المستخدم
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 ml-2" />
                    الصلاحيات: {userRole === "admin" ? "مدير" : "بائع"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {userRole === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/users" className="cursor-pointer">
                          <Users className="h-4 w-4 ml-2" />
                          إدارة المستخدمين
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <Activity className="h-4 w-4 ml-2" />
                    سجل النشاط
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = "/login"}>
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* عمود الإعدادات */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors">الألوان</TabsTrigger>
                <TabsTrigger value="logos">اللوجوهات</TabsTrigger>
                <TabsTrigger value="categories">إدارة الفئات</TabsTrigger>
                <TabsTrigger value="icons">الأيقونات</TabsTrigger>
              </TabsList>

              {/* تبويب الألوان */}
              <TabsContent value="colors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="h-5 w-5 ml-2" />
                      نظام الألوان
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* الألوان المحددة مسبقاً */}
                    <div>
                      <Label className="text-base font-medium">الألوان المحددة مسبقاً</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {Object.entries(presetColors).map(([name, colors]) => (
                          <Button
                            key={name}
                            variant="outline"
                            className="h-auto p-3 justify-start"
                            onClick={() => applyPresetColors(colors)}
                          >
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <div className="flex space-x-1 space-x-reverse">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.primary }} />
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.secondary }} />
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.accent }} />
                              </div>
                              <span className="text-sm">{name}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* الألوان المخصصة */}
                    <div>
                      <Label className="text-base font-medium">الألوان المخصصة</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                        {Object.entries(colorScheme).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-sm capitalize">
                              {key === 'primary' && 'اللون الأساسي'}
                              {key === 'secondary' && 'اللون الثانوي'}
                              {key === 'accent' && 'لون التمييز'}
                              {key === 'background' && 'لون الخلفية'}
                              {key === 'surface' && 'لون السطح'}
                              {key === 'text' && 'لون النص'}
                              {key === 'success' && 'لون النجاح'}
                              {key === 'warning' && 'لون التحذير'}
                              {key === 'error' && 'لون الخطأ'}
                            </Label>
                            <div className="flex space-x-2 space-x-reverse">
                              <Input
                                type="color"
                                value={value}
                                onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                                className="w-12 h-10 p-1 border-2"
                              />
                              <Input
                                type="text"
                                value={value}
                                onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                                className="flex-1 font-mono text-sm"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* الوضع المظلم */}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">الوضع المظلم</Label>
                        <p className="text-sm text-slate-600">تفعيل المظهر المظلم للنظام</p>
                      </div>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={setIsDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* تبويب اللوجوهات */}
              <TabsContent value="logos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 ml-2" />
                      إدارة اللوجوهات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* لوجو الشركة */}
                    <div>
                      <Label className="text-base font-medium">لوجو الشركة</Label>
                      <div className="mt-3 p-4 border-2 border-dashed border-slate-300 rounded-lg">
                        <div className="flex items-center justify-center space-x-3 space-x-reverse">
                          {logoSettings.company ? (
                            <img src={logoSettings.company} alt="Company Logo" className="h-16 w-auto" />
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Upload className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload('company', e)}
                              className="hidden"
                              id="company-logo"
                            />
                            <Button variant="outline" asChild>
                              <label htmlFor="company-logo">رفع لوجو الشركة</label>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* لوجو لوحة التحكم */}
                    <div>
                      <Label className="text-base font-medium">أيقونة لوحة التحكم</Label>
                      <div className="mt-3 p-4 border-2 border-dashed border-slate-300 rounded-lg">
                        <div className="flex items-center justify-center space-x-3 space-x-reverse">
                          {logoSettings.dashboard ? (
                            <img src={logoSettings.dashboard} alt="Dashboard Icon" className="h-12 w-auto" />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Home className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload('dashboard', e)}
                              className="hidden"
                              id="dashboard-icon"
                            />
                            <Button variant="outline" asChild>
                              <label htmlFor="dashboard-icon">رفع أيقونة لوحة التحكم</label>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* لوجوهات الشركات المصنعة */}
                    <div>
                      <Label className="text-base font-medium">لوجوهات الشركات المصنعة</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                        {Object.entries(logoSettings.manufacturers).map(([manufacturer, logo]) => (
                          <div key={manufacturer} className="p-3 border rounded-lg">
                            <div className="text-center space-y-3">
                              <div className="h-16 flex items-center justify-center">
                                {logo ? (
                                  <img src={logo} alt={manufacturer} className="h-full w-auto max-w-full" />
                                ) : (
                                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-slate-500">{manufacturer}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleLogoUpload(manufacturer, e)}
                                  className="hidden"
                                  id={`logo-${manufacturer}`}
                                />
                                <Button variant="outline" size="sm" asChild className="w-full">
                                  <label htmlFor={`logo-${manufacturer}`}>
                                    {logo ? 'تغيير' : 'رفع'} لوجو
                                  </label>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* تبويب إدارة الفئات */}
              <TabsContent value="categories" className="space-y-6">
                <CategoryManager 
                  open={true}
                  onOpenChange={() => {}}
                  manufacturers={Object.keys(logoSettings.manufacturers)}
                  manufacturerCategories={manufacturerCategories}
                  onSave={(updatedCategories) => {
                    setManufacturerCategories(updatedCategories);
                    console.log("حفظ الفئات:", updatedCategories);
                    toast({
                      title: "تم الحفظ",
                      description: "تم حفظ إعدادات الفئات بنجاح",
                    });
                  }}
                />
              </TabsContent>

              {/* تبويب الأيقونات */}
              <TabsContent value="icons" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 ml-2" />
                      إدارة الأيقونات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(iconSettings).map(([key, iconName]) => (
                        <div key={key} className="p-3 border rounded-lg">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              {iconName === 'Home' && <Home className="h-5 w-5" />}
                              {iconName === 'Package' && <Table className="h-5 w-5" />}
                              {iconName === 'Building' && <LayoutGrid className="h-5 w-5" />}
                              {iconName === 'BarChart3' && <BarChart3 className="h-5 w-5" />}
                              {iconName === 'Settings' && <Settings className="h-5 w-5" />}
                              {iconName === 'Users' && <Users className="h-5 w-5" />}
                              {iconName === 'Bell' && <Bell className="h-5 w-5" />}
                              {iconName === 'UserCircle' && <UserCircle className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                              <Label className="text-sm font-medium">
                                {key === 'dashboard' && 'لوحة التحكم'}
                                {key === 'inventory' && 'المخزون'}
                                {key === 'manufacturers' && 'الشركات المصنعة'}
                                {key === 'reports' && 'التقارير'}
                                {key === 'settings' && 'الإعدادات'}
                                {key === 'users' && 'المستخدمين'}
                                {key === 'notifications' && 'الإشعارات'}
                                {key === 'profile' && 'الملف الشخصي'}
                              </Label>
                              <p className="text-xs text-slate-500">أيقونة {iconName}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* عمود المعاينة */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="h-5 w-5 ml-2" />
                    معاينة
                  </span>
                  <div className="flex space-x-1 space-x-reverse">
                    <Button
                      variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`${
                    previewDevice === 'mobile' ? 'w-80' : 
                    previewDevice === 'tablet' ? 'w-96' : 'w-full'
                  } mx-auto border rounded-lg overflow-hidden`}
                  style={{ 
                    backgroundColor: colorScheme.background,
                    minHeight: '400px'
                  }}
                >
                  {/* معاينة شريط التنقل */}
                  <div 
                    className="p-4 border-b"
                    style={{ backgroundColor: colorScheme.surface }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: colorScheme.primary }}
                        >
                          <span className="text-white font-bold text-sm">ش</span>
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: colorScheme.text }}>
                            إدارة المخزون
                          </h3>
                        </div>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          size="sm" 
                          style={{ 
                            backgroundColor: colorScheme.primary,
                            color: 'white'
                          }}
                        >
                          جدول
                        </Button>
                        <Button size="sm" variant="outline">
                          بطاقات
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* معاينة المحتوى */}
                  <div className="p-4 space-y-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: colorScheme.surface }}
                    >
                      <h4 className="font-medium mb-2" style={{ color: colorScheme.text }}>
                        إحصائيات المخزون
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className="p-2 rounded text-center"
                          style={{ backgroundColor: colorScheme.primary, color: 'white' }}
                        >
                          <div className="text-lg font-bold">7</div>
                          <div className="text-xs">إجمالي</div>
                        </div>
                        <div 
                          className="p-2 rounded text-center"
                          style={{ backgroundColor: colorScheme.success, color: 'white' }}
                        >
                          <div className="text-lg font-bold">4</div>
                          <div className="text-xs">متوفر</div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: colorScheme.surface }}
                    >
                      <Badge style={{ backgroundColor: colorScheme.accent, color: 'white' }}>
                        مرسيدس E200
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات إضافية */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">نصائح التصميم</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <p>• استخدم ألوان متباينة لضمان سهولة القراءة</p>
                <p>• تأكد من أن اللوجوهات بصيغة PNG مع خلفية شفافة</p>
                <p>• الحد الأدنى لحجم اللوجو هو 100x100 بيكسل</p>
                <p>• اختبر المظهر على جميع أحجام الشاشات</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}