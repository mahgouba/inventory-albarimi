import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle, Wrench, ShoppingCart, User, Building, Users, Calendar } from "lucide-react";

// Type definitions for inventory statistics
interface InventoryStats {
  total: number;
  available: number;
  inTransit: number;
  maintenance: number;
  reserved: number;
  sold: number;
  personal: number;
  company: number;
  usedPersonal: number;
}

// Manufacturer logos mapping
const manufacturerLogos: { [key: string]: string } = {
  "مرسيدس": "🔹",
  "لاند روفر": "🟢", 
  "تويوتا": "🔴",
  "بي ام دبليو": "🔵",
  "اودي": "⚪",
  "فورد": "⚫",
  "نيسان": "🔺",
  "هيونداي": "🔶",
};

export default function InventoryStats() {
  const { data: stats, isLoading } = useQuery<InventoryStats>({
    queryKey: ["/api/inventory/stats"],
  });

  const { data: manufacturerStats, isLoading: isLoadingManufacturers } = useQuery({
    queryKey: ["/api/inventory/manufacturer-stats"],
  });

  if (isLoading || isLoadingManufacturers) {
    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const mainStatsData = [
    {
      title: "قيد الصيانة",
      value: stats?.maintenance || 0,
      icon: Wrench,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "متوفر",
      value: stats?.available || 0,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "في الطريق",
      value: stats?.inTransit || 0,
      icon: Truck,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "إجمالي العناصر",
      value: stats?.total || 0,
      icon: Package,
      color: "bg-teal-100 text-teal-600",
    },
  ];

  const secondRowStatsData = [
    {
      title: "محجوز",
      value: stats?.reserved || 0,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const importStatsData = [
    {
      title: "شخصي",
      value: stats?.personal || 0,
      icon: User,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "شركة",
      value: stats?.company || 0,
      icon: Building,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "مستعمل شخصي",
      value: stats?.usedPersonal || 0,
      icon: Users,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mainStatsData.map((stat, index) => (
          <Card key={index} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="text-xl" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Reserved box first */}
        {secondRowStatsData.map((stat, index) => (
          <Card key={index} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="text-xl" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Then import type stats */}
        {importStatsData.map((stat, index) => (
          <Card key={index} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="text-xl" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manufacturer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {manufacturerStats?.slice(0, 6).map((manufacturer: any, index: number) => (
          <Card key={index} className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {manufacturer.logo ? (
                  <img 
                    src={manufacturer.logo} 
                    alt={manufacturer.manufacturer}
                    className="w-8 h-8 object-contain rounded"
                  />
                ) : (
                  <span className="text-2xl">{manufacturerLogos[manufacturer.manufacturer] || "🔸"}</span>
                )}
                {manufacturer.manufacturer}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">إجمالي:</span>
                  <span className="font-semibold">{manufacturer.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">شخصي:</span>
                  <span className="font-medium text-blue-600">{manufacturer.personal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">شركة:</span>
                  <span className="font-medium text-purple-600">{manufacturer.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">مستعمل:</span>
                  <span className="font-medium text-orange-600">{manufacturer.usedPersonal}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
