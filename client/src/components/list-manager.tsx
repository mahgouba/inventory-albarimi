import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Edit2, Plus, Check, X, Settings, Car, Factory } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ListManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listsData: {
    manufacturers: string[];
    manufacturerCategories: Record<string, string[]>; // { "مرسيدس": ["E200", "C200"], "بي ام دبليو": ["X5", "X3"] }
    engineCapacities: string[];
    statuses: string[];
    importTypes: string[];
    locations: string[];
    exteriorColors: string[];
    interiorColors: string[];
  };
  onSave: (type: string, newList: string[] | Record<string, string[]>) => void;
}

export default function ListManager({ open, onOpenChange, listsData, onSave }: ListManagerProps) {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<{type: string, index: number, value: string} | null>(null);
  const [newItem, setNewItem] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<{type: string, index: number, value: string} | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");

  const listConfigs = [
    { key: "manufacturers", label: "الشركات المصنعة", color: "bg-blue-100 text-blue-800" },
    { key: "manufacturerCategories", label: "فئات الشركات المصنعة", color: "bg-indigo-100 text-indigo-800" },
    { key: "engineCapacities", label: "سعات المحرك", color: "bg-green-100 text-green-800" },
    { key: "statuses", label: "حالات المركبة", color: "bg-purple-100 text-purple-800" },
    { key: "importTypes", label: "أنواع الاستيراد", color: "bg-orange-100 text-orange-800" },
    { key: "locations", label: "المواقع", color: "bg-teal-100 text-teal-800" },
    { key: "exteriorColors", label: "الألوان الخارجية", color: "bg-red-100 text-red-800" },
    { key: "interiorColors", label: "الألوان الداخلية", color: "bg-pink-100 text-pink-800" }
  ];

  const handleAddItem = (type: string) => {
    if (!newItem.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال قيمة صحيحة",
        variant: "destructive",
      });
      return;
    }

    const currentList = listsData[type as keyof typeof listsData] || [];
    if (currentList.includes(newItem.trim())) {
      toast({
        title: "خطأ",
        description: "هذا العنصر موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    const newList = [...currentList, newItem.trim()];
    onSave(type, newList);
    setNewItem("");
    toast({
      title: "تم بنجاح",
      description: "تم إضافة العنصر الجديد",
    });
  };

  const handleEditItem = (type: string, index: number, newValue: string) => {
    const currentList = listsData[type as keyof typeof listsData] || [];
    if (!newValue.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال قيمة صحيحة",
        variant: "destructive",
      });
      return;
    }

    if (currentList.includes(newValue.trim()) && currentList[index] !== newValue.trim()) {
      toast({
        title: "خطأ",
        description: "هذا العنصر موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    const newList = [...currentList];
    newList[index] = newValue.trim();
    onSave(type, newList);
    setEditingItem(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث العنصر",
    });
  };

  const handleDeleteItem = () => {
    if (!showDeleteDialog) return;
    
    const { type, index } = showDeleteDialog;
    const currentList = listsData[type as keyof typeof listsData] || [];
    const newList = currentList.filter((_, i) => i !== index);
    onSave(type, newList);
    setShowDeleteDialog(null);
    toast({
      title: "تم بنجاح",
      description: "تم حذف العنصر",
    });
  };

  const renderListItems = (type: string, items: string[], color: string) => (
    <div className="space-y-3">
      {/* إضافة عنصر جديد */}
      <div className="flex gap-2 p-3 bg-slate-50 rounded-lg">
        <Input
          placeholder="إضافة عنصر جديد..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem(type)}
          className="flex-1"
        />
        <Button onClick={() => handleAddItem(type)} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* قائمة العناصر */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white border rounded-lg">
            {editingItem?.type === type && editingItem?.index === index ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingItem.value}
                  onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditItem(type, index, editingItem.value);
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleEditItem(type, index, editingItem.value)}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setEditingItem(null)}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <>
                <Badge variant="secondary" className={color}>
                  {item}
                </Badge>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setEditingItem({type, index, value: item})}
                  >
                    <Edit2 className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowDeleteDialog({type, index, value: item})}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              إدارة قوائم الخيارات
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="manufacturers" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              {listConfigs.map((config) => (
                <TabsTrigger 
                  key={config.key} 
                  value={config.key}
                  className="text-xs"
                >
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {listConfigs.map((config) => (
              <TabsContent key={config.key} value={config.key} className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">{config.label}</Label>
                    <Badge variant="outline">
                      {(listsData[config.key as keyof typeof listsData] || []).length} عنصر
                    </Badge>
                  </div>
                  {renderListItems(
                    config.key, 
                    listsData[config.key as keyof typeof listsData] || [], 
                    config.color
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{showDeleteDialog?.value}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}