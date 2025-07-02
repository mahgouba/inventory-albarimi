import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface EditableSelectProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  onAddOption?: (option: string) => void;
  placeholder: string;
  className?: string;
}

export default function EditableSelect({ 
  options, 
  value, 
  onValueChange, 
  onAddOption, 
  placeholder,
  className 
}: EditableSelectProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (newOption.trim() && onAddOption) {
      onAddOption(newOption.trim());
      onValueChange(newOption.trim());
      setNewOption("");
      setIsAdding(false);
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
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
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