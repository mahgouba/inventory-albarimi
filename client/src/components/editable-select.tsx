import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Edit } from "lucide-react";

interface EditableSelectProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  onAddOption?: (option: string) => void;
  onDeleteOption?: (option: string) => void;
  onEditOption?: (oldOption: string, newOption: string) => void;
  placeholder: string;
  className?: string;
}

export default function EditableSelect({ 
  options, 
  value, 
  onValueChange, 
  onAddOption,
  onDeleteOption,
  onEditOption,
  placeholder,
  className 
}: EditableSelectProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [newOption, setNewOption] = useState("");
  const [editValue, setEditValue] = useState("");

  const handleAddOption = () => {
    if (newOption.trim() && onAddOption) {
      onAddOption(newOption.trim());
      onValueChange(newOption.trim());
      setNewOption("");
      setIsAdding(false);
    }
  };

  const handleEditOption = () => {
    if (editValue.trim() && onEditOption && editingOption) {
      onEditOption(editingOption, editValue.trim());
      if (value === editingOption) {
        onValueChange(editValue.trim());
      }
      setEditingOption(null);
      setEditValue("");
    }
  };

  const handleDeleteOption = (option: string) => {
    if (onDeleteOption) {
      onDeleteOption(option);
      if (value === option) {
        onValueChange("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddOption();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewOption("");
    }
  };

  if (isAdding) {
    return (
      <div className="flex items-center space-x-2 space-x-reverse">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="أدخل خيار جديد..."
          className="flex-1"
          autoFocus
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddOption}
          disabled={!newOption.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsAdding(false);
            setNewOption("");
          }}
        >
          إلغاء
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <div key={option} className="flex items-center justify-between p-2 hover:bg-slate-100">
              {editingOption === option ? (
                <div className="flex items-center space-x-2 space-x-reverse w-full">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditOption();
                      } else if (e.key === 'Escape') {
                        setEditingOption(null);
                        setEditValue("");
                      }
                    }}
                    className="flex-1 h-8"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEditOption}
                    className="h-8 w-8 p-0"
                  >
                    ✓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingOption(null);
                      setEditValue("");
                    }}
                    className="h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <>
                  <SelectItem value={option} className="flex-1 border-none">
                    {option}
                  </SelectItem>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {onEditOption && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOption(option);
                          setEditValue(option);
                        }}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {onDeleteOption && options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOption(option);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </SelectContent>
      </Select>
      {onAddOption && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          title="إضافة خيار جديد"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}