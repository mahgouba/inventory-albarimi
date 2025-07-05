import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Eye, Edit, DollarSign, Table, LayoutGrid, Bell, UserCircle, Settings, LogOut, Palette, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { getStatusColor } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";

interface CardViewPageProps {
  userRole: string;
}

export default function CardViewPage({ userRole }: CardViewPageProps) {
  const [expandedManufacturers, setExpandedManufacturers] = useState<Set<string>>(new Set());

  // Get theme settings
  const { companyName, companyLogo } = useTheme();

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: manufacturerStats = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory/manufacturer-stats"],
  });

  // Filter out sold cars and group by manufacturer and category
  const availableItems = items.filter(item => !item.isSold);
  
  const groupedData = availableItems.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = {
        items: [],
        categories: {}
      };
    }
    acc[item.manufacturer].items.push(item);
    
    if (!acc[item.manufacturer].categories[item.category]) {
      acc[item.manufacturer].categories[item.category] = {
        available: 0,
        inTransit: 0,
        maintenance: 0
      };
    }
    
    if (item.status === "متوفر") {
      acc[item.manufacturer].categories[item.category].available++;
    } else if (item.status === "في الطريق") {
      acc[item.manufacturer].categories[item.category].inTransit++;
    } else if (item.status === "قيد الصيانة") {
      acc[item.manufacturer].categories[item.category].maintenance++;
    }
    
    return acc;
  }, {} as Record<string, { items: InventoryItem[], categories: Record<string, any> }>);

  // Get manufacturer logo
  const getManufacturerLogo = (manufacturerName: string) => {
    const manufacturer = manufacturerStats.find((m) => m.manufacturer === manufacturerName);
    return manufacturer?.logo;
  };

  const toggleManufacturer = (manufacturer: string) => {
    const newExpanded = new Set(expandedManufacturers);
    if (newExpanded.has(manufacturer)) {
      newExpanded.delete(manufacturer);
    } else {
      newExpanded.add(manufacturer);
    }
    setExpandedManufacturers(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg sm:text-xl">ش</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">{companyName}</h1>
                <span className="text-xs text-slate-500 font-latin">Inventory System</span>
              </div>
            </div>
            
            {/* Mobile and Desktop Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              {/* Navigation Tabs - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2 space-x-reverse border border-slate-200 rounded-lg p-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                    <Table size={14} className="ml-1" />
                    <span className="hidden lg:inline">جدول</span>
                  </Button>
                </Link>
                <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                  <LayoutGrid size={14} className="ml-1" />
                  <span className="hidden lg:inline">بطاقات</span>
                </Button>
              </div>
              
              {/* Mobile Navigation Icons */}
              <div className="flex md:hidden items-center space-x-1 space-x-reverse">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 p-2">
                    <Table size={16} />
                  </Button>
                </Link>
                <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white p-2">
                  <LayoutGrid size={16} />
                </Button>
              </div>

              {/* Appearance Management Button - Always Visible */}
              <Link href="/appearance">
                <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200 transition-colors">
                  <Palette size={16} className="ml-1" />
                  <span className="hidden sm:inline">إدارة المظهر</span>
                  <span className="sm:hidden">المظهر</span>
                </Button>
              </Link>

              {/* Admin Management Buttons - Admin Only */}
              {userRole === "admin" && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link href="/appearance">
                    <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200 transition-colors">
                      <Palette size={16} className="ml-1" />
                      <span className="hidden sm:inline">إدارة المظهر</span>
                      <span className="sm:hidden">المظهر</span>
                    </Button>
                  </Link>
                  
                  <Link href="/user-management">
                    <Button variant="outline" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 transition-colors">
                      <Users size={16} className="ml-1" />
                      <span className="hidden sm:inline">إدارة المستخدمين</span>
                      <span className="sm:hidden">المستخدمين</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* User Actions */}
              <div className="flex items-center space-x-1 space-x-reverse">
                <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800 hidden sm:flex">
                  <Bell size={18} />
                </Button>
                
                {/* Admin Dropdown Menu */}
                {userRole === "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                        <Settings size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <Link href="/appearance">
                        <DropdownMenuItem>
                          <Palette className="mr-2 h-4 w-4" />
                          إدارة المظهر
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/user-management">
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          إدارة المستخدمين
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <Link href="/manufacturers">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          الشركات المصنعة
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                  <UserCircle size={18} />
                </Button>
              </div>
              
              {/* Logout Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-600 hover:bg-red-50 hidden sm:flex"
                onClick={() => window.location.href = '/login'}
              >
                <LogOut size={16} className="mr-1" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">عرض البطاقات</h1>
          <p className="text-slate-600">عرض المركبات مجمعة حسب الصانع</p>
        </div>

        {/* Manufacturer Headers */}
        <div className="space-y-8">
          {Object.entries(groupedData).map(([manufacturer, data]) => {
            const logo = getManufacturerLogo(manufacturer);
            const totalCount = data.items.length;
            const availableCount = data.items.filter(item => item.status === "متوفر").length;
            
            return (
              <Card key={manufacturer} className="shadow-sm border border-slate-200">
                <Collapsible
                  open={expandedManufacturers.has(manufacturer)}
                  onOpenChange={() => toggleManufacturer(manufacturer)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 space-x-reverse">
                          {/* Manufacturer Logo */}
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 shadow-sm">
                            {logo ? (
                              <img 
                                src={logo} 
                                alt={manufacturer}
                                className="w-16 h-16 object-contain rounded-full"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-slate-600">
                                {manufacturer.charAt(0)}
                              </span>
                            )}
                          </div>
                          
                          {/* Manufacturer Name and Count */}
                          <div className="flex flex-col">
                            <CardTitle className="text-2xl text-slate-800 mb-2">{manufacturer}</CardTitle>
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <Badge variant="secondary" className="bg-teal-50 text-teal-700 px-4 py-2 text-base font-semibold">
                                {totalCount} مركبة
                              </Badge>
                              <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 px-4 py-2 text-base font-semibold">
                                {availableCount} متوفر
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {expandedManufacturers.has(manufacturer) ? (
                            <ChevronUp className="h-6 w-6 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">


                      {/* Individual vehicles */}
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3">جميع المركبات</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.items.map((item) => (
                            <Card key={item.id} className={`border hover:shadow-md transition-shadow ${item.isSold ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Header with category and status */}
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-800">{item.category}</h3>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <Badge variant="secondary" className={getStatusColor(item.status)}>
                                        {item.status}
                                      </Badge>
                                      {item.isSold && (
                                        <Badge variant="destructive" className="bg-red-600 text-white">
                                          مباع
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Vehicle details */}
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">سعة المحرك:</span>
                                      <span className="font-medium font-latin">{item.engineCapacity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">السنة:</span>
                                      <span className="font-medium font-latin">{item.year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">اللون الخارجي:</span>
                                      <span className="font-medium">{item.exteriorColor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">الموقع:</span>
                                      <span className="font-medium">{item.location}</span>
                                    </div>
                                    {item.price && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-600">السعر:</span>
                                        <span className="font-medium text-green-600">{item.price} ر.س</span>
                                      </div>
                                    )}
                                    {item.soldDate && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-600">تاريخ البيع:</span>
                                        <span className="font-medium text-red-600">
                                          {new Date(item.soldDate).toLocaleDateString('ar-SA')}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex justify-between pt-2 border-t border-slate-100">
                                    <div className="flex space-x-2 space-x-reverse">
                                      {userRole === "admin" && (
                                        <>
                                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-green-600 hover:text-green-800"
                                            disabled={item.isSold}
                                          >
                                            <DollarSign className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {item.entryDate ? new Date(item.entryDate).toLocaleDateString('ar-SA') : ''}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}