import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Download, 
  Printer, 
  Bot,
  Settings,
  X,
  Car,
  FileText
} from "lucide-react";

interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface AnimatedFABProps {
  actions: FABAction[];
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  size?: "sm" | "md" | "lg";
}

export default function AnimatedFAB({ 
  actions, 
  position = "bottom-right", 
  size = "md" 
}: AnimatedFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6", 
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2"
  };

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: 18,
    md: 20,
    lg: 24
  };

  const fabVariants = {
    closed: {
      rotate: 0,
      scale: 1,
    },
    open: {
      rotate: 45,
      scale: 1.1,
    }
  };

  const actionsContainerVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const actionItemVariants = {
    closed: {
      opacity: 0,
      scale: 0.5,
      y: 20,
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const backdropVariants = {
    closed: {
      opacity: 0,
    },
    open: {
      opacity: 1,
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`fixed ${positionClasses[position]} z-50 flex flex-col items-center`}>
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={actionsContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-col items-center space-y-3 mb-4"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  variants={actionItemVariants}
                  className="relative group"
                >
                  {/* Action Label */}
                  <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {action.label}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-4 border-l-slate-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    onClick={() => {
                      action.onClick();
                      setIsOpen(false);
                    }}
                    className={`${sizeClasses[size]} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                      action.color || "bg-teal-600 hover:bg-teal-700"
                    } text-white border-0`}
                    size="icon"
                  >
                    {action.icon}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.div
          variants={fabVariants}
          animate={isOpen ? "open" : "closed"}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 fab-floating`}
            size="icon"
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X size={iconSizes[size]} /> : <Plus size={iconSizes[size]} />}
            </motion.div>
          </Button>
        </motion.div>

        {/* Pulse Animation for Main FAB when closed */}
        {!isOpen && (
          <motion.div
            className={`absolute ${sizeClasses[size]} rounded-full bg-teal-600/30 -z-10 fab-pulse-ring`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </>
  );
}

// Pre-configured FAB components for common use cases
export function InventoryFAB({ 
  onAddItem, 
  onSearch, 
  onExport, 
  onPrint, 
  onVoiceChat 
}: {
  onAddItem: () => void;
  onSearch: () => void;
  onExport: () => void;
  onPrint: () => void;
  onVoiceChat: () => void;
}) {
  const actions: FABAction[] = [
    {
      id: "voice",
      label: "المساعد الصوتي",
      icon: <Bot size={18} />,
      onClick: onVoiceChat,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      id: "add",
      label: "إضافة مركبة جديدة",
      icon: <Car size={18} />,
      onClick: onAddItem,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "search",
      label: "البحث المتقدم",
      icon: <Search size={18} />,
      onClick: onSearch,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      id: "export",
      label: "تصدير البيانات",
      icon: <Download size={18} />,
      onClick: onExport,
      color: "bg-teal-600 hover:bg-teal-700"
    },
    {
      id: "print",
      label: "طباعة التقرير",
      icon: <Printer size={18} />,
      onClick: onPrint,
      color: "bg-amber-600 hover:bg-amber-700"
    }
  ];

  return <AnimatedFAB actions={actions} position="bottom-left" />;
}

export function CardViewFAB({ 
  onVoiceChat, 
  onSettings 
}: {
  onVoiceChat: () => void;
  onSettings: () => void;
}) {
  const actions: FABAction[] = [
    {
      id: "voice",
      label: "المساعد الصوتي",
      icon: <Bot size={18} />,
      onClick: onVoiceChat,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      id: "settings",
      label: "إعدادات العرض",
      icon: <Settings size={18} />,
      onClick: onSettings,
      color: "bg-slate-600 hover:bg-slate-700"
    }
  ];

  return <AnimatedFAB actions={actions} position="bottom-left" size="md" />;
}