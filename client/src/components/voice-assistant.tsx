import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, 
  MicOff, 
  Bot, 
  Volume2, 
  Camera,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  X,
  Loader2,
  Send,
  Type
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryItem } from "@shared/schema";

interface VoiceAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem?: () => void;
  onEditItem?: (item: InventoryItem) => void;
  onSellItem?: (itemId: number) => void;
  onDeleteItem?: (itemId: number) => void;
  onExtractChassisNumber?: (imageFile: File) => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: 'add' | 'edit' | 'sell' | 'delete' | 'search' | 'extract-chassis';
    data?: any;
  };
}

interface VoiceCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  action?: string;
  data?: any;
}

export default function VoiceAssistant({
  open,
  onOpenChange,
  onAddItem,
  onEditItem,
  onSellItem,
  onDeleteItem,
  onExtractChassisNumber
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [currentWaveform, setCurrentWaveform] = useState<number[]>([]);
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get inventory data for context
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: open
  });

  // Process voice command mutation
  const processCommand = useMutation({
    mutationFn: async (command: string) => {
      return await apiRequest("POST", "/api/voice/process", { command });
    },
    onSuccess: (result: VoiceCommand) => {
      handleCommandResult(result);
    },
    onError: (error) => {
      console.error("Error processing command:", error);
      addMessage("assistant", "عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى.");
      speakText("عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى.");
    }
  });

  // Extract chassis number from image
  const extractChassisNumber = useMutation({
    mutationFn: async (imageData: string) => {
      return await apiRequest("POST", "/api/voice/extract-chassis", { imageData });
    },
    onSuccess: (result) => {
      if (result.chassisNumber) {
        addMessage("assistant", `تم استخراج رقم الهيكل: ${result.chassisNumber}`);
        speakText(`تم استخراج رقم الهيكل: ${result.chassisNumber}`);
      } else {
        addMessage("assistant", "لم أتمكن من العثور على رقم الهيكل في الصورة.");
        speakText("لم أتمكن من العثور على رقم الهيكل في الصورة.");
      }
    },
    onError: () => {
      addMessage("assistant", "حدث خطأ أثناء معالجة الصورة.");
      speakText("حدث خطأ أثناء معالجة الصورة.");
    }
  });

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "غير مدعوم",
        description: "متصفحك لا يدعم التعرف على الصوت",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';

    recognition.onstart = () => {
      setIsListening(true);
      generateWaveform();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        addMessage("user", finalTranscript);
        processCommand.mutate(finalTranscript);
        setTranscript("");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setCurrentWaveform([]);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "الإذن مرفوض",
          description: "يرجى السماح بالوصول إلى الميكروفون",
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setCurrentWaveform([]);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Generate waveform animation
  const generateWaveform = () => {
    const interval = setInterval(() => {
      setCurrentWaveform(prev => {
        const newWaveform = Array.from({ length: 12 }, () => Math.random() * 100);
        return newWaveform;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setCurrentWaveform([]);
    }, 5000);
  };

  // Add message to conversation
  const addMessage = (type: 'user' | 'assistant', content: string, action?: Message['action']) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      action
    };
    
    setMessages(prev => [...prev, message]);
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle text input send
  const handleSendText = () => {
    if (textInput.trim()) {
      setIsProcessing(true);
      addMessage("user", textInput.trim());
      processCommand.mutate(textInput.trim());
      setTextInput("");
    }
  };

  // Handle enter key in text input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Handle command results
  const handleCommandResult = (result: VoiceCommand) => {
    setIsProcessing(false);

    switch (result.action) {
      case 'add_vehicle':
        addMessage("assistant", "سأقوم بفتح نموذج إضافة مركبة جديدة.", {
          type: 'add',
          data: result.data
        });
        speakText("سأقوم بفتح نموذج إضافة مركبة جديدة.");
        if (onAddItem) onAddItem();
        break;

      case 'search_vehicle':
        const searchTerm = result.entities.searchTerm;
        const foundItems = inventoryItems.filter((item: InventoryItem) => 
          item.manufacturer.includes(searchTerm) ||
          item.category.includes(searchTerm) ||
          item.chassisNumber?.includes(searchTerm)
        );
        
        if (foundItems.length > 0) {
          addMessage("assistant", `وجدت ${foundItems.length} مركبة مطابقة لبحثك عن "${searchTerm}".`);
          speakText(`وجدت ${foundItems.length} مركبة مطابقة لبحثك.`);
        } else {
          addMessage("assistant", `لم أجد أي مركبة مطابقة لبحثك عن "${searchTerm}".`);
          speakText("لم أجد أي مركبة مطابقة لبحثك.");
        }
        break;

      case 'sell_vehicle':
        const sellChassisNumber = result.entities.chassisNumber;
        const itemToSell = inventoryItems.find((item: InventoryItem) => 
          item.chassisNumber === sellChassisNumber
        );
        
        if (itemToSell) {
          addMessage("assistant", `سأقوم ببيع المركبة برقم الهيكل ${sellChassisNumber}.`, {
            type: 'sell',
            data: itemToSell.id
          });
          speakText(`تم بيع المركبة برقم الهيكل ${sellChassisNumber} بنجاح.`);
          if (onSellItem) onSellItem(itemToSell.id);
        } else {
          addMessage("assistant", `لم أجد مركبة برقم الهيكل ${sellChassisNumber}.`);
          speakText("لم أجد المركبة المطلوبة.");
        }
        break;

      case 'delete_vehicle':
        const deleteChassisNumber = result.entities.chassisNumber;
        const itemToDelete = inventoryItems.find((item: InventoryItem) => 
          item.chassisNumber === deleteChassisNumber
        );
        
        if (itemToDelete) {
          addMessage("assistant", `سأقوم بحذف المركبة برقم الهيكل ${deleteChassisNumber}.`, {
            type: 'delete',
            data: itemToDelete.id
          });
          speakText(`تم حذف المركبة برقم الهيكل ${deleteChassisNumber} بنجاح.`);
          if (onDeleteItem) onDeleteItem(itemToDelete.id);
        } else {
          addMessage("assistant", `لم أجد مركبة برقم الهيكل ${deleteChassisNumber}.`);
          speakText("لم أجد المركبة المطلوبة.");
        }
        break;

      case 'extract_chassis':
        addMessage("assistant", "يرجى التقاط صورة لرقم الهيكل أو رفع صورة.", {
          type: 'extract-chassis'
        });
        speakText("يرجى التقاط صورة لرقم الهيكل.");
        break;

      case 'get_stats':
        const availableCount = inventoryItems.filter((item: InventoryItem) => item.status === 'متوفر').length;
        const soldCount = inventoryItems.filter((item: InventoryItem) => item.status === 'مباع').length;
        const totalCount = inventoryItems.length;
        
        const statsMessage = `إجمالي المركبات: ${totalCount}، المتوفر: ${availableCount}، المباعة: ${soldCount}`;
        addMessage("assistant", statsMessage);
        speakText(statsMessage);
        break;

      default:
        addMessage("assistant", result.content || "تم معالجة طلبك.");
        speakText(result.content || "تم معالجة طلبك.");
    }
  };

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        setIsProcessing(true);
        recognitionRef.current.start();
      }
    }
  };

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      addMessage("assistant", "مرحباً! أنا المساعد الصوتي لإدارة المخزون. يمكنني مساعدتك في إضافة، تعديل، بيع أو حذف المركبات، بالإضافة إلى استخراج أرقام الهيكل من الصور. كيف يمكنني مساعدتك؟");
      speakText("مرحباً! أنا المساعد الصوتي لإدارة المخزون. كيف يمكنني مساعدتك؟");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] p-0">
        <DialogTitle className="sr-only">المساعد الصوتي</DialogTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold">المساعد الصوتي</h2>
              {isSpeaking && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  يتحدث
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
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
                        <div className="mt-2 flex gap-2">
                          {message.action.type === 'add' && (
                            <Button size="sm" variant="secondary" onClick={onAddItem}>
                              <Plus className="h-3 w-3 mr-1" />
                              إضافة مركبة
                            </Button>
                          )}
                          {message.action.type === 'extract-chassis' && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file && onExtractChassisNumber) {
                                    onExtractChassisNumber(file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              <Camera className="h-3 w-3 mr-1" />
                              رفع صورة
                            </Button>
                          )}
                        </div>
                      )}
                      <span className="text-xs opacity-60 block mt-1">
                        {message.timestamp.toLocaleTimeString('ar-SA')}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Controls */}
          <div className="p-4 border-t">
            <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "voice" | "text")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="voice" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  صوتي
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  نص
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="voice" className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  {/* Waveform visualization */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div 
                        className="flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        {currentWaveform.map((height, index) => (
                          <motion.div
                            key={index}
                            className="w-1 bg-green-500 rounded-full"
                            animate={{
                              height: `${Math.max(height / 4, 8)}px`,
                            }}
                            transition={{
                              duration: 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Microphone button */}
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "default"}
                    className={`rounded-full p-4 ${
                      isListening 
                        ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={toggleListening}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : isListening ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                {/* Current transcript */}
                {transcript && (
                  <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {transcript}
                  </div>
                )}

                {/* Status */}
                <div className="mt-2 text-center text-xs text-gray-500">
                  {isListening ? "أستمع..." : isProcessing ? "أعالج الطلب..." : "اضغط للتحدث"}
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب أمرك هنا..."
                    className="flex-1"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleSendText}
                    disabled={!textInput.trim() || isProcessing}
                    className="px-4"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Status */}
                <div className="text-center text-xs text-gray-500">
                  {isProcessing ? "أعالج الطلب..." : "اكتب أمرك واضغط إدخال أو أيقونة الإرسال"}
                </div>
                
                {/* Text input examples */}
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <div className="text-center font-medium">أمثلة:</div>
                  <div className="grid grid-cols-1 gap-1 text-right">
                    <div>• "أضف مرسيدس C200 موديل 2023"</div>
                    <div>• "بيع المركبة رقم 50"</div>
                    <div>• "ابحث عن مرسيدس"</div>
                    <div>• "اعرض الإحصائيات"</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}