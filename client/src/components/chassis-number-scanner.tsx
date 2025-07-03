import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChassisNumberScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChassisNumberExtracted: (chassisNumber: string) => void;
}

export default function ChassisNumberScanner({ 
  open, 
  onOpenChange, 
  onChassisNumberExtracted 
}: ChassisNumberScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [manualInput, setManualInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 10 ميجابايت.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      extractChassisNumber(result);
    };
    reader.readAsDataURL(file);
  };

  const extractChassisNumber = async (imageBase64: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/extract-chassis-number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          image: imageBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في استخراج رقم الهيكل");
      }

      const data = await response.json();
      setExtractedText(data.chassisNumber || "");
      
      if (data.chassisNumber) {
        toast({
          title: "تم استخراج رقم الهيكل بنجاح",
          description: `رقم الهيكل: ${data.chassisNumber}`,
        });
      } else {
        toast({
          title: "لم يتم العثور على رقم الهيكل",
          description: "يرجى المحاولة مرة أخرى أو إدخال الرقم يدوياً",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في استخراج رقم الهيكل",
        description: "حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    const finalChassisNumber = extractedText.trim() || manualInput.trim();
    if (finalChassisNumber) {
      onChassisNumberExtracted(finalChassisNumber);
      handleClose();
    } else {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهيكل أو اختيار صورة صحيحة",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setExtractedText("");
    setManualInput("");
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleCameraCapture = () => {
    // Trigger file input for camera capture
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera size={20} />
            تصوير رقم الهيكل
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">اختر صورة رقم الهيكل</Label>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCameraCapture}
                disabled={isProcessing}
                className="flex-1"
              >
                <Camera size={16} className="ml-2" />
                تصوير بالكاميرا
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1"
              >
                <Upload size={16} className="ml-2" />
                اختيار من الملفات
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="space-y-2">
              <Label>الصورة المختارة</Label>
              <div className="relative border rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="رقم الهيكل"
                  className="w-full h-48 object-contain bg-gray-50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm text-gray-600">جاري تحليل الصورة واستخراج رقم الهيكل...</span>
            </div>
          )}

          {/* Extracted Text */}
          {extractedText && (
            <div className="space-y-2">
              <Label>رقم الهيكل المستخرج</Label>
              <Input
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="رقم الهيكل"
                className="font-mono"
              />
            </div>
          )}

          {/* Manual Input */}
          <div className="space-y-2">
            <Label>أو أدخل رقم الهيكل يدوياً</Label>
            <Input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="أدخل رقم الهيكل يدوياً"
              className="font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing || (!extractedText.trim() && !manualInput.trim())}
            >
              تأكيد
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}