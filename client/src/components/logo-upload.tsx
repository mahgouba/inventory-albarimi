import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image } from "lucide-react";

interface LogoUploadProps {
  value?: string;
  onChange: (logo: string) => void;
  className?: string;
  maxSize?: number; // في الكيلوبايت
}

export default function LogoUpload({ value, onChange, className, maxSize = 500 }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = async (file: File): Promise<boolean> => {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, SVG)');
      return false;
    }

    // التحقق من حجم الملف
    if (file.size > maxSize * 1024) {
      setError(`حجم الملف كبير جداً. الحد الأقصى ${maxSize} كيلوبايت`);
      return false;
    }

    // التحقق من أبعاد الصورة
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width > 1024 || img.height > 1024) {
          setError('أبعاد الصورة كبيرة جداً. الحد الأقصى 1024×1024 بكسل');
          resolve(false);
        } else {
          setError(null);
          resolve(true);
        }
      };
      img.onerror = () => {
        setError('فشل في قراءة الصورة');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // التحقق من صحة الملف
      const isValid = await validateFile(file);
      if (!isValid) {
        setUploading(false);
        return;
      }

      // تحويل الملف إلى base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        // تحسين الصورة إذا كانت كبيرة
        if (file.size > 100 * 1024) { // إذا كانت أكبر من 100KB
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // حساب الأبعاد الجديدة مع الحفاظ على النسبة
            const maxSize = 300;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
              onChange(optimizedBase64);
            }
            setUploading(false);
          };
          img.src = base64;
        } else {
          onChange(base64);
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError('فشل في قراءة الملف');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('فشل في رفع اللوجو');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
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

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Logo"
            className="w-24 h-24 object-contain border border-slate-200 rounded-lg bg-white p-3"
            onError={(e) => {
              console.error('Error loading image:', e);
              setError('فشل في تحميل الصورة');
            }}
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
                  <span className="text-xs text-slate-500 mt-1">
                    PNG, JPG, SVG (أقل من {maxSize}KB)
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
      )}
    </div>
  );
}