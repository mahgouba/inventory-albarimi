import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, MessageSquare, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface VoiceChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
  data?: any;
}

export default function VoiceChat({ open, onOpenChange }: VoiceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Voice processing mutation
  const voiceProcessMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');
      
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('فشل في معالجة الصوت');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      handleVoiceResult(result);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في معالجة الصوت",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleVoiceResult = (result: any) => {
    setIsProcessing(false);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: result.transcription,
      timestamp: new Date(),
    };
    
    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: result.response,
      timestamp: new Date(),
      action: result.action,
      data: result.data,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);

    // Execute action if needed
    if (result.action) {
      executeAction(result.action, result.data);
    }

    // Speak response
    if (result.response) {
      speakText(result.response);
    }
  };

  const executeAction = async (action: string, data: any) => {
    switch (action) {
      case 'add_vehicle':
        if (data.vehicleData) {
          try {
            await apiRequest('POST', '/api/inventory', data.vehicleData);
            queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
            queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
            queryClient.invalidateQueries({ queryKey: ['/api/inventory/manufacturer-stats'] });
            
            toast({
              title: "تم إضافة المركبة",
              description: "تم إضافة المركبة بنجاح إلى المخزون",
            });
          } catch (error: any) {
            toast({
              title: "خطأ في إضافة المركبة",
              description: error.message,
              variant: "destructive",
            });
          }
        }
        break;
        
      case 'sell_vehicle':
        if (data.vehicleId) {
          try {
            await apiRequest('POST', `/api/inventory/${data.vehicleId}/sell`);
            queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
            queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
            queryClient.invalidateQueries({ queryKey: ['/api/inventory/manufacturer-stats'] });
            
            toast({
              title: "تم بيع المركبة",
              description: "تم تحديث حالة المركبة إلى مباع",
            });
          } catch (error: any) {
            toast({
              title: "خطأ في بيع المركبة",
              description: error.message,
              variant: "destructive",
            });
          }
        }
        break;
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);
        voiceProcessMutation.mutate(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "بدء التسجيل",
        description: "تحدث الآن لإعطاء أمر صوتي",
      });
      
    } catch (error) {
      toast({
        title: "خطأ في التسجيل",
        description: "لا يمكن الوصول للميكروفون",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: 'مرحباً! يمكنك استخدام الأوامر الصوتية لإدارة المخزون. مثل: "أضف مركبة مرسيدس E200" أو "بيع المركبة رقم 123" أو "أظهر إحصائيات المخزون"',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            المساعد الصوتي
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-96 w-full">
            <div className="space-y-3 p-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <CardContent className="p-3">
                      <p className="text-sm">{message.content}</p>
                      {message.action && (
                        <Badge variant="outline" className="mt-2">
                          {message.action === 'add_vehicle' && 'إضافة مركبة'}
                          {message.action === 'sell_vehicle' && 'بيع مركبة'}
                          {message.action === 'search_inventory' && 'البحث في المخزون'}
                        </Badge>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('ar-SA')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <Card className="bg-gray-100 dark:bg-gray-800">
                    <CardContent className="p-3">
                      <p className="text-sm">جاري المعالجة...</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className="flex-1"
            >
              {isRecording ? <MicOff className="h-4 w-4 ml-2" /> : <Mic className="h-4 w-4 ml-2" />}
              {isRecording ? "إيقاف التسجيل" : "ابدأ التسجيل"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={clearChat}
              disabled={isProcessing || isRecording}
            >
              مسح
            </Button>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>أمثلة على الأوامر الصوتية:</strong><br />
                • "أضف مركبة مرسيدس E200 سنة 2023"<br />
                • "بيع المركبة رقم الهيكل ABC123"<br />
                • "أظهر إحصائيات المخزون"<br />
                • "ابحث عن مركبات BMW"
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}