import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image } from "lucide-react";

interface LogoUploadProps {
  value?: string;
  onChange: (logo: string) => void;
  className?: string;
}

export default function LogoUpload({ value, onChange, className }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. يرجى اختيار ملف أقل من 2 ميجابايت');
      return;
    }

    setUploading(true);
    
    try {
      // Convert to base64 for simple storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('فشل في رفع اللوجو');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">اللوجو</label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4 ml-1" />
            حذف
          </Button>
        )}
      </div>

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Logo"
            className="w-24 h-24 object-contain border border-slate-200 rounded-lg bg-white p-3"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white hover:text-slate-200"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 ml-1" />
                تغيير
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
          <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer hover:border-slate-400 transition-colors">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 font-medium">رفع شعار الشركة</span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG, SVG (أقل من 2MB)</span>
                </>
              )}
            </div>
          </label>
        </div>
      )}
    </div>
  );
}