import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Car, Factory, Edit2, X, Check, Settings } from "lucide-react";
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

interface ManufacturerCategoriesButtonProps {
  manufacturer: string;
  categories: string[];
  onCategoriesChange: (newCategories: string[]) => void;
  disabled?: boolean;
}

export default function ManufacturerCategoriesButton({ 
  manufacturer, 
  categories, 
  onCategoriesChange,
  disabled = false
}: ManufacturerCategoriesButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<{index: number, category: string} | null>(null);
  const [localCategories, setLocalCategories] = useState<string[]>(categories);

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    if (localCategories.includes(newCategory.trim())) {
      toast({
        title: "هذه الفئة موجودة بالفعل",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = [...localCategories, newCategory.trim()];
    setLocalCategories(updatedCategories);
    setNewCategory("");
    
    toast({
      title: "تم إضافة الفئة",
      description: `تم إضافة "${newCategory.trim()}" بنجاح`,
    });
  };

  const startEdit = (index: number, category: string) => {
    setEditingIndex(index);
    setEditingValue(category);
  };

  const saveEdit = () => {
    if (!editingValue.trim()) {
      toast({
        title: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    if (localCategories.includes(editingValue.trim()) && editingValue.trim() !== localCategories[editingIndex!]) {
      toast({
        title: "هذه الفئة موجودة بالفعل",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = [...localCategories];
    updatedCategories[editingIndex!] = editingValue.trim();
    setLocalCategories(updatedCategories);
    setEditingIndex(null);
    setEditingValue("");
    
    toast({
      title: "تم تحديث الفئة",
      description: "تم تحديث اسم الفئة بنجاح",
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const deleteCategory = (index: number) => {
    const updatedCategories = localCategories.filter((_, i) => i !== index);
    setLocalCategories(updatedCategories);
    setShowDeleteDialog(null);
    
    toast({
      title: "تم حذف الفئة",
      description: "تم حذف الفئة بنجاح",
    });
  };

  const handleSave = () => {
    onCategoriesChange(localCategories);
    setOpen(false);
    toast({
      title: "تم الحفظ",
      description: `تم حفظ فئات ${manufacturer} بنجاح`,
    });
  };

  const handleCancel = () => {
    setLocalCategories(categories); // استعادة القيم الأصلية
    setNewCategory("");
    setEditingIndex(null);
    setEditingValue("");
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled || !manufacturer}
        className="h-8 px-3 text-xs"
      >
        <Settings className="h-3 w-3 ml-1" />
        إدارة فئات {manufacturer}
      </Button>

      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-right">
              <Factory className="h-5 w-5 ml-2" />
              إدارة فئات {manufacturer}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* إضافة فئة جديدة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة فئة جديدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="اسم الفئة الجديدة"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    className="flex-1"
                  />
                  <Button onClick={addCategory} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* قائمة الفئات الحالية */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Car className="h-4 w-4 ml-2" />
                  الفئات الحالية ({localCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {localCategories.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد فئات لهذا الصانع</p>
                    <p className="text-sm">قم بإضافة فئة جديدة أعلاه</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {localCategories.map((category, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        {editingIndex === index ? (
                          <>
                            <Input
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="flex-1 h-8"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={saveEdit}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary" className="flex-1 justify-start">
                              {category}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(index, category)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowDeleteDialog({index, category})}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
              <Button onClick={handleSave}>
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* تأكيد الحذف */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الفئة "{showDeleteDialog?.category}"؟
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && deleteCategory(showDeleteDialog.index)}
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