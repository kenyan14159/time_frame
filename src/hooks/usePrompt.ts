import { useState, useCallback } from 'react';

/**
 * プロンプトダイアログを表示するフック
 */
export function usePrompt() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: ((value: string) => void) | null;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const prompt = useCallback((
    title: string,
    message: string,
    options?: {
      defaultValue?: string;
      placeholder?: string;
      confirmLabel?: string;
      cancelLabel?: string;
    }
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        message,
        defaultValue: options?.defaultValue,
        placeholder: options?.placeholder,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
        onConfirm: (value: string) => {
          setState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
          });
          resolve(value);
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

  const handleConfirm = useCallback((value: string) => {
    if (state.onConfirm) {
      state.onConfirm(value);
    }
  }, [state.onConfirm]);

  return {
    prompt,
    cancel,
    handleConfirm,
    ...state,
  };
}

