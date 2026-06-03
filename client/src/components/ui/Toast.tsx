import { useUIStore } from '@/stores/uiStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl',
            'animate-slide-in max-w-sm',
            toast.variant === 'destructive'
              ? 'border-red-500/30 bg-red-950/80 text-red-200'
              : toast.variant === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
              : 'border-white/10 bg-slate-900/90 text-white'
          )}
        >
          <div className="shrink-0 mt-0.5">
            {toast.variant === 'destructive' ? (
              <AlertCircle className="h-4 w-4 text-red-400" />
            ) : toast.variant === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <Info className="h-4 w-4 text-white/60" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs opacity-70">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
