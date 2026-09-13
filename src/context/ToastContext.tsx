import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle2, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    error: (message: string) => void;
    success: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const playErrorSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    
    osc1.frequency.setValueAtTime(200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    
    osc2.frequency.setValueAtTime(205, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};

const ToastItem: React.FC<{ t: Toast; onRemove: (id: string) => void }> = ({ t, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(t.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [t.id, onRemove]);

  const icons = {
    error: <AlertTriangle className="w-5 h-5 text-red-600" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    error: 'bg-green-950/60',
    success: 'bg-emerald-100',
    info: 'bg-blue-100',
  };

  const barColors = {
    error: 'bg-green-950/400',
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="pointer-events-auto relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-4 pr-12 min-w-[320px] max-w-[400px] border border-slate-100 overflow-hidden flex items-start gap-3"
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${bgColors[t.type]}`}>
        {icons[t.type]}
      </div>
      
      <div className="flex flex-col justify-center min-h-[40px]">
        <h4 className="text-slate-900 font-semibold text-sm leading-tight mb-0.5">
          {t.type === 'error' ? 'Error' : t.type === 'success' ? 'Success' : 'Information'}
        </h4>
        <p className="text-slate-500 font-medium text-sm leading-snug">
          {t.message}
        </p>
      </div>
      
      <button
        onClick={() => onRemove(t.id)}
        className="absolute right-3 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 ${barColors[t.type]}`}
      />
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (type === 'error') {
      playErrorSound();
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastMethods = React.useMemo(() => {
    const fn = (message: string, type: ToastType = 'info') => addToast(message, type);
    return Object.assign(fn, {
      error: (message: string) => addToast(message, 'error'),
      success: (message: string) => addToast(message, 'success'),
      info: (message: string) => addToast(message, 'info'),
      addToast: (message: string, type: ToastType = 'info') => addToast(message, type),
      showToast: (message: string, type: ToastType = 'info') => addToast(message, type),
      toast: fn,
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} t={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
