import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Car, Factory, Edit2, X, Check } from "lucide-react";
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

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturers: string[];
  manufacturerCategories: Record<string, string[]>;
  onSave: (manufacturerCategories: Record<string, string[]>) => void;
}

export default function CategoryManager({ 
  open, 
  onOpenChange, 
  manufacturers, 
  manufacturerCategories, 
  onSave 
}: CategoryManagerProps) {
  const { toast } = useToast();
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{manufacturer: string, index: number, value: string} | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{manufacturer: string, index: number, category: string} | null>(null);

  const addCategory = () => {
    if (!selectedManufacturer || !newCategory.trim()) {
      toast({
        title: "يرجى اختيار شركة مصنعة وإدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    const currentCategories = { ...manufacturerCategories };
    
    // Initialize manufacturer if not exists
    if (!currentCategories[selectedManufacturer]) {
      currentCategories[selectedManufacturer] = [];
    }

    // Check if category already exists
    if (currentCategories[selectedManufacturer].includes(newCategory.trim())) {
      toast({
        title: "الفئة موجودة بالفعل لهذه الشركة",
        variant: "destructive",
      });
      return;
    }

    currentCategories[selectedManufacturer] = [...currentCategories[selectedManufacturer], newCategory.trim()];
    onSave(currentCategories);
    setNewCategory("");
    toast({
      title: "تم إضافة الفئة بنجاح",
    });
  };

  const editCategory = (manufacturer: string, index: number, newValue: string) => {
    if (!newValue.trim()) return;

    const currentCategories = { ...manufacturerCategories };
    const categories = [...currentCategories[manufacturer]];
    
    // Check if new value already exists (excluding current one)
    if (categories.filter((_, i) => i !== index).includes(newValue.trim())) {
      toast({
        title: "الفئة موجودة بالفعل",
        variant: "destructive",
      });
      return;
    }

    categories[index] = newValue.trim();
    currentCategories[manufacturer] = categories;
    onSave(currentCategories);
    setEditingCategory(null);
    toast({
      title: "تم تعديل الفئة بنجاح",
    });
  };

  const deleteCategory = (manufacturer: string, index: number) => {
    const currentCategories = { ...manufacturerCategories };
    currentCategories[manufacturer] = currentCategories[manufacturer].filter((_, i) => i !== index);
    
    // Remove manufacturer if no categories left
    if (currentCategories[manufacturer].length === 0) {
      delete currentCategories[manufacturer];
    }
    
    onSave(currentCategories);
    setShowDeleteDialog(null);
    toast({
      title: "تم حذف الفئة بنجاح",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Car className="h-5 w-5 ml-2" />
              إدارة فئات الشركات المصنعة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Category Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إضافة فئة جديدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label>الشركة المصنعة</Label>
                    <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر شركة مصنعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers.map((manufacturer) => (
                          <SelectItem key={manufacturer} value={manufacturer}>
                            {manufacturer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>اسم الفئة</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="مثال: E200, C300, X5"
                        onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                      />
                      <Button onClick={addCategory} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الفئات الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(manufacturerCategories).length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    لا توجد فئات مضافة بعد
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(manufacturerCategories).map(([manufacturer, categories]) => (
                      <div key={manufacturer} className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Factory className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-lg text-slate-800">{manufacturer}</h4>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            {categories.length} فئة
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-6">
                          {categories.map((category, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-slate-50 rounded-md p-3 border"
                            >
                              {editingCategory?.manufacturer === manufacturer && editingCategory?.index === index ? (
                                <div className="flex items-center space-x-2 space-x-reverse flex-1">
                                  <Input
                                    value={editingCategory.value}
                                    onChange={(e) => setEditingCategory({
                                      ...editingCategory,
                                      value: e.target.value
                                    })}
                                    className="h-8 text-sm"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        editCategory(manufacturer, index, editingCategory.value);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => editCategory(manufacturer, index, editingCategory.value)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingCategory(null)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="flex-1 text-sm font-medium">{category}</span>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingCategory({
                                        manufacturer,
                                        index,
                                        value: category
                                      })}
                                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setShowDeleteDialog({
                                        manufacturer,
                                        index,
                                        category
                                      })}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        {manufacturer !== Object.keys(manufacturerCategories)[Object.keys(manufacturerCategories).length - 1] && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الفئة "{showDeleteDialog?.category}" من "{showDeleteDialog?.manufacturer}"؟
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showDeleteDialog) {
                  deleteCategory(showDeleteDialog.manufacturer, showDeleteDialog.index);
                }
              }}
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