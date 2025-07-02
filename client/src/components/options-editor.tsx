import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface OptionsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: string[];
  onSave: (newOptions: string[]) => void;
}

export default function OptionsEditor({ open, onOpenChange, title, options, onSave }: OptionsEditorProps) {
  const [localOptions, setLocalOptions] = useState<string[]>(options);
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (newOption.trim() && !localOptions.includes(newOption.trim())) {
      setLocalOptions([...localOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (optionToRemove: string) => {
    setLocalOptions(localOptions.filter(option => option !== optionToRemove));
  };

  const handleSave = () => {
    onSave(localOptions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تحرير {title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">الخيارات الحالية:</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {localOptions.map((option, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {option}
                  <button
                    type="button"
                    onClick={() => removeOption(option)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Add New Option */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">إضافة خيار جديد:</h4>
            <div className="flex gap-2">
              <Input
                placeholder="اكتب الخيار الجديد..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
              />
              <Button type="button" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}