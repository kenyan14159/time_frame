import { useEffect, useState, useRef } from 'react';

interface PromptDialogProps {
  open: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  open,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  confirmLabel = 'OK',
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // ダイアログが開いたら入力フィールドにフォーカス
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [open]);

  // ESCキーで閉じる
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  // フォーカストラップ（アクセシビリティ向上）
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // フォーカス可能な要素を取得
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Tabキーでフォーカストラップ
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: 逆方向
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: 順方向
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleTab);
    return () => {
      dialog.removeEventListener('keydown', handleTab);
    };
  }, [open]);

  // モーダル表示時に背景のスクロールを無効化
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setValue(defaultValue);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-dialog-title"
      aria-describedby="prompt-dialog-message"
      onClick={(e) => {
        // 背景クリックで閉じる
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* ダイアログ */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up"
      >
        <h3
          id="prompt-dialog-title"
          className="text-lg font-semibold text-text-primary mb-3"
        >
          {title}
        </h3>
        <p
          id="prompt-dialog-message"
          className="text-text-secondary mb-4 leading-relaxed"
        >
          {message}
        </p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-surface-hover border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors mb-6"
          autoComplete="off"
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-surface-hover text-text-secondary rounded-lg hover:bg-border transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="submit"
            disabled={!value.trim()}
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

