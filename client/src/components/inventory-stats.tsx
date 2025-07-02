import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle, Wrench } from "lucide-react";

export default function InventoryStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/inventory/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "إجمالي العناصر",
      value: stats?.total || 0,
      icon: Package,
      color: "bg-teal-100 text-teal-600",
    },
    {
      title: "في الطريق",
      value: stats?.inTransit || 0,
      icon: Truck,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "متوفر",
      value: stats?.available || 0,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "قيد الصيانة",
      value: stats?.maintenance || 0,
      icon: Wrench,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
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
  );
}
