import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    warning: <AlertTriangle size={20} className="text-yellow-400" />,
    info: <Info size={20} className="text-blue-400" />
  };

  const bgColors = {
    success: 'bg-emerald-950/90 border-emerald-500/30',
    error: 'bg-red-950/90 border-red-500/30',
    warning: 'bg-yellow-950/90 border-yellow-500/30',
    info: 'bg-blue-950/90 border-blue-500/30'
  };

  return (
    <div className={`pointer-events-auto w-80 p-4 rounded-xl border backdrop-blur-md shadow-xl flex gap-3 animate-in slide-in-from-right-full transition-all duration-300 ${bgColors[toast.type]}`}>
      <div className="flex-shrink-0 pt-0.5">
        {icons[toast.type]}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-100">{toast.title}</h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
      </div>
      <button 
        onClick={onRemove}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors h-fit"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;