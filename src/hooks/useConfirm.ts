import { useState, useCallback } from 'react';

/**
 * 確認ダイアログを表示するフック
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: 'default' | 'danger';
    onConfirm: (() => void) | null;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const confirm = useCallback((
    title: string,
    message: string,
    options?: {
      confirmLabel?: string;
      cancelLabel?: string;
      confirmVariant?: 'default' | 'danger';
    }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        message,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
        confirmVariant: options?.confirmVariant,
        onConfirm: () => {
          setState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
          });
          resolve(true);
        },
      });
    });
  }, []);

  const cancel = useCallback(() => {
    setState({
      open: false,
      title: '',
      message: '',
      onConfirm: null,
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm();
    }
  }, [state.onConfirm]);

  return {
    confirm,
    cancel,
    handleConfirm,
    ...state,
  };
}

