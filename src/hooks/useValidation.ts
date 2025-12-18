import { useState, useCallback } from 'react';
import type { FormData } from '../types';

export interface ValidationError {
  field: keyof FormData;
  message: string;
}

export function useValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateForm = useCallback((formData: FormData): boolean => {
    const newErrors: ValidationError[] = [];

    // 大会名/練習メニューのバリデーション（任意、文字数制限のみ）
    if (formData.eventName.trim() && formData.eventName.length > 50) {
      newErrors.push({ field: 'eventName', message: '大会名/練習メニューは50文字以内で入力してください' });
    }

    // 種目/場所のバリデーション（任意、文字数制限のみ）
    if (formData.eventType.trim() && formData.eventType.length > 30) {
      newErrors.push({ field: 'eventType', message: '種目/場所は30文字以内で入力してください' });
    }

    // 記録/タイムのバリデーション（必須）
    if (!formData.record.trim()) {
      newErrors.push({ field: 'record', message: '記録/タイムを入力してください' });
    } else if (formData.record.length > 20) {
      newErrors.push({ field: 'record', message: '記録/タイムは20文字以内で入力してください' });
    }

    // 背景画像のバリデーション
    if (!formData.backgroundImage) {
      newErrors.push({ field: 'backgroundImage', message: '背景画像を選択してください' });
    }

    // コメントのバリデーション
    if (formData.comment.length > 30) {
      newErrors.push({ field: 'comment', message: 'コメントは30文字以内で入力してください' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, []);

  const getError = useCallback((field: keyof FormData): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  }, [errors]);

  const clearError = useCallback((field: keyof FormData) => {
    setErrors(prev => prev.filter(e => e.field !== field));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    validateForm,
    getError,
    clearError,
    clearAllErrors,
    hasErrors: errors.length > 0,
  };
}
