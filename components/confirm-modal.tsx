"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card border border-white/20 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                isDangerous
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isLoading ? "..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
