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
            'flex items-start gap-3 rounded-xl border p-4 shadow-xl bg-white max-w-sm border-l-4 animate-slide-in',
            toast.variant === 'destructive'
              ? 'border-slate-100 border-l-red-500 text-slate-800'
              : toast.variant === 'success'
              ? 'border-slate-100 border-l-emerald-500 text-slate-800'
              : 'border-slate-100 border-l-blue-500 text-slate-800'
          )}
        >
          <div className="shrink-0 mt-0.5">
            {toast.variant === 'destructive' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : toast.variant === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <Info className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs text-slate-500 font-medium leading-normal">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
