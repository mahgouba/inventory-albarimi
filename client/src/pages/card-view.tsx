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

export default function CardViewPage() {
  const [expandedManufacturers, setExpandedManufacturers] = useState<Set<string>>(new Set());

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Group items by manufacturer
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = [];
    }
    acc[item.manufacturer].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

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
                <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">عرض البطاقات</h1>
          <p className="text-slate-600">عرض المركبات مجمعة حسب الصانع</p>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([manufacturer, manufacturerItems]) => (
            <Card key={manufacturer} className="shadow-lg">
              <Collapsible
                open={expandedManufacturers.has(manufacturer)}
                onOpenChange={() => toggleManufacturer(manufacturer)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-teal-700">
                            {manufacturer.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-xl text-slate-800">{manufacturer}</CardTitle>
                          <p className="text-sm text-slate-600">
                            {manufacturerItems.length} مركبة
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
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {manufacturerItems.map((item) => (
                        <Card key={item.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header with category and status */}
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">{item.category}</h3>
                                <Badge variant="secondary" className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
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
                                  <span className="text-slate-600">اللون الداخلي:</span>
                                  <span className="font-medium">{item.interiorColor}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">الموقع:</span>
                                  <span className="font-medium">{item.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">نوع الاستيراد:</span>
                                  <span className="font-medium">{item.importType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">رقم الهيكل:</span>
                                  <span className="font-medium font-latin text-xs">{item.chassisNumber}</span>
                                </div>
                                {item.notes && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">الملاحظات:</span>
                                    <span className="font-medium text-xs">{item.notes}</span>
                                  </div>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="flex justify-between pt-2 border-t border-slate-100">
                                <div className="flex space-x-2 space-x-reverse">
                                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-800">
                                    <Eye className="h-4 w-4" />
                                  </Button>
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
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}