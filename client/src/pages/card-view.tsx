import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Eye, Edit, DollarSign, Table, LayoutGrid, Bell, UserCircle } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";

interface CardViewPageProps {
  userRole: string;
}

export default function CardViewPage({ userRole }: CardViewPageProps) {
  const [expandedManufacturers, setExpandedManufacturers] = useState<Set<string>>(new Set());

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: manufacturerStats = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory/manufacturer-stats"],
  });

  // Group items by manufacturer and category
  const groupedData = items.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = {
        items: [],
        categories: {}
      };
    }
    acc[item.manufacturer].items.push(item);
    
    if (!acc[item.manufacturer].categories[item.category]) {
      acc[item.manufacturer].categories[item.category] = {
        total: 0,
        available: 0,
        inTransit: 0,
        maintenance: 0,
        sold: 0
      };
    }
    
    acc[item.manufacturer].categories[item.category].total++;
    if (item.isSold) {
      acc[item.manufacturer].categories[item.category].sold++;
    } else if (item.status === "متوفر") {
      acc[item.manufacturer].categories[item.category].available++;
    } else if (item.status === "في الطريق") {
      acc[item.manufacturer].categories[item.category].inTransit++;
    } else if (item.status === "صيانة") {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <h1 className="text-2xl font-bold text-slate-800">نظام إدارة المخزون</h1>
              <span className="text-sm text-slate-500 font-latin">Inventory Management</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse border border-slate-200 rounded-lg p-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                    <Table size={16} className="ml-1" />
                    جدول
                  </Button>
                </Link>
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  <LayoutGrid size={16} className="ml-1" />
                  بطاقات
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                <UserCircle size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => window.location.href = '/login'}
              >
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

        <div className="space-y-4">
          {Object.entries(groupedData).map(([manufacturer, data]) => {
            const logo = getManufacturerLogo(manufacturer);
            const totalCount = data.items.length;
            const availableCount = data.items.filter(item => !item.isSold && item.status === "متوفر").length;
            
            return (
              <Card key={manufacturer} className="shadow-sm border border-slate-200">
                <Collapsible
                  open={expandedManufacturers.has(manufacturer)}
                  onOpenChange={() => toggleManufacturer(manufacturer)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          {/* Manufacturer Logo */}
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                            {logo ? (
                              <img 
                                src={logo} 
                                alt={manufacturer}
                                className="w-12 h-12 object-contain rounded-full"
                              />
                            ) : (
                              <span className="text-xl font-bold text-slate-600">
                                {manufacturer.charAt(0)}
                              </span>
                            )}
                          </div>
                          
                          {/* Manufacturer Info */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl text-slate-800 mb-1">{manufacturer}</CardTitle>
                              <div className="flex items-center space-x-4 space-x-reverse">
                                {/* Category counts */}
                                {Object.entries(data.categories).map(([category, stats]) => (
                                  <div key={category} className="text-center min-w-[60px]">
                                    <div className="text-lg font-bold text-slate-700">{stats.total}</div>
                                    <div className="text-xs text-slate-500">{category}</div>
                                  </div>
                                ))}
                                <div className="text-center min-w-[60px] mr-4">
                                  <div className="text-lg font-bold text-teal-600">{availableCount}</div>
                                  <div className="text-xs text-slate-500">متوفر</div>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">
                              {totalCount} مركبة إجمالي • {availableCount} متوفر
                            </p>
                          </div>
                        </div>
                        {expandedManufacturers.has(manufacturer) ? (
                          <ChevronUp className="h-5 w-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-500" />
                        )}
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