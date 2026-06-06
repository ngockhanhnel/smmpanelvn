import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../types';

interface ToastItemProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const styleMap = {
    success: {
      bg: 'bg-[#121E1C]/90 backdrop-blur-md',
      border: 'border-brand-success/30 hover:border-brand-success/50',
      iconColor: 'text-brand-success',
      icon: CheckCircle,
      glow: 'shadow-[0_0_15px_-3px_rgba(0,200,150,0.25)]',
    },
    error: {
      bg: 'bg-[#1E1214]/90 backdrop-blur-md',
      border: 'border-brand-danger/30 hover:border-brand-danger/50',
      iconColor: 'text-brand-danger',
      icon: AlertCircle,
      glow: 'shadow-[0_0_15px_-3px_rgba(255,71,87,0.25)]',
    },
    warning: {
      bg: 'bg-[#1F1E14]/90 backdrop-blur-md',
      border: 'border-brand-warning/30 hover:border-brand-warning/50',
      iconColor: 'text-brand-warning',
      icon: AlertTriangle,
      glow: 'shadow-[0_0_15px_-3px_rgba(255,184,0,0.25)]',
    },
    info: {
      bg: 'bg-[#121824]/90 backdrop-blur-md',
      border: 'border-brand-cyan/20 hover:border-brand-cyan/45',
      iconColor: 'text-brand-cyan',
      icon: Info,
      glow: 'shadow-[0_0_15px_-3px_rgba(0,212,255,0.25)]',
    },
  };

  const currentStyle = styleMap[toast.type];
  const Icon = currentStyle.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: 50, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 p-4 pr-10 rounded-xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow} text-white max-w-sm w-full relative group transition-all duration-300`}
    >
      <div className={`shrink-0 ${currentStyle.iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="text-sm font-medium leading-normal tracking-wide text-gray-200">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 bg-transparent text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <div className="flex flex-col items-end gap-3 w-full pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={onRemove} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
