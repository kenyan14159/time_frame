import { useState, useCallback } from 'react';
import type { FormData, CustomizeSettings, Template } from '../types';
import { defaultTemplate, getTemplateById } from '../templates';

// LocalStorageのキー
const STORAGE_KEYS = {
  DRAFT: 'timeframe-draft',
  HISTORY: 'timeframe-history',
  FAVORITES: 'timeframe-favorites',
  CUSTOM_TEMPLATES: 'timeframe-custom-templates',
} as const;

// 保存されるドラフトデータの型
interface DraftData {
  formData: Omit<FormData, 'backgroundImage'>;
  customizeSettings: CustomizeSettings;
  templateId: string;
  savedAt: number;
}

// 履歴アイテムの型
export interface HistoryItem {
  id: string;
  formData: Omit<FormData, 'backgroundImage'>;
  customizeSettings: CustomizeSettings;
  templateId: string;
  createdAt: number;
  thumbnailDataUrl?: string;
}

// カスタムテンプレートの型
export interface CustomTemplate {
  id: string;
  name: string;
  customizeSettings: CustomizeSettings;
  templateId: string;
  createdAt: number;
}

// LocalStorage保存フック
export function useLocalStorage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  // 初期ロード（同期的に実行）
  if (!isLoaded) {
    try {
      // 履歴を読み込み
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as HistoryItem[];
        // 最新20件のみ保持 - 初期値として設定
        setTimeout(() => setHistory(parsed.slice(0, 20)), 0);
      }

      // カスタムテンプレートを読み込み
      const savedCustomTemplates = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      if (savedCustomTemplates) {
        setTimeout(() => setCustomTemplates(JSON.parse(savedCustomTemplates)), 0);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    setTimeout(() => setIsLoaded(true), 0);
  }

  // ドラフトを保存
  const saveDraft = useCallback((
    formData: FormData,
    customizeSettings: CustomizeSettings,
    templateId: string
  ) => {
    try {
      const draft: DraftData = {
        formData: {
          eventName: formData.eventName,
          eventType: formData.eventType,
          record: formData.record,
          comment: formData.comment,
        },
        customizeSettings,
        templateId,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, []);

  // ドラフトを読み込み
  const loadDraft = useCallback((): {
    formData: Omit<FormData, 'backgroundImage'>;
    customizeSettings: CustomizeSettings;
    template: Template;
  } | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (saved) {
        const draft = JSON.parse(saved) as DraftData;
        // 24時間以内のドラフトのみ復元
        if (Date.now() - draft.savedAt < 24 * 60 * 60 * 1000) {
          const template = getTemplateById(draft.templateId) || defaultTemplate;
          return {
            formData: draft.formData,
            customizeSettings: draft.customizeSettings,
            template,
          };
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  }, []);

  // ドラフトをクリア
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  // 履歴に追加
  const addToHistory = useCallback((
    formData: FormData,
    customizeSettings: CustomizeSettings,
    templateId: string,
    thumbnailDataUrl?: string
  ) => {
    try {
      const newItem: HistoryItem = {
        id: `history-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        formData: {
          eventName: formData.eventName,
          eventType: formData.eventType,
          record: formData.record,
          comment: formData.comment,
        },
        customizeSettings,
        templateId,
        createdAt: Date.now(),
        thumbnailDataUrl,
      };

      setHistory(prev => {
        const updated = [newItem, ...prev].slice(0, 20);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  }, []);

  // 履歴から削除
  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 履歴をクリア
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }, []);

  // カスタムテンプレートを保存
  const saveCustomTemplate = useCallback((
    name: string,
    customizeSettings: CustomizeSettings,
    templateId: string
  ) => {
    try {
      const newTemplate: CustomTemplate = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        customizeSettings,
        templateId,
        createdAt: Date.now(),
      };

      setCustomTemplates(prev => {
        const updated = [newTemplate, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(updated));
        return updated;
      });

      return newTemplate;
    } catch (error) {
      console.error('Failed to save custom template:', error);
      return null;
    }
  }, []);

  // カスタムテンプレートを削除
  const removeCustomTemplate = useCallback((id: string) => {
    setCustomTemplates(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    isLoaded,
    // ドラフト
    saveDraft,
    loadDraft,
    clearDraft,
    // 履歴
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    // カスタムテンプレート
    customTemplates,
    saveCustomTemplate,
    removeCustomTemplate,
  };
}
