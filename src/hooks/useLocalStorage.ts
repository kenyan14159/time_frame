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

// 最大履歴件数
const MAX_HISTORY_ITEMS = 10;

// 安全にLocalStorageに保存する関数
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, clearing old data...');
      return false;
    }
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

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
        // 最新件数のみ保持 - 初期値として設定
        setTimeout(() => setHistory(parsed.slice(0, MAX_HISTORY_ITEMS)), 0);
      }

      // カスタムテンプレートを読み込み
      const savedCustomTemplates = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      if (savedCustomTemplates) {
        setTimeout(() => setCustomTemplates(JSON.parse(savedCustomTemplates)), 0);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // 破損データの場合はクリア
      try {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      } catch {
        // 無視
      }
    }
    setTimeout(() => setIsLoaded(true), 0);
  }

  // ドラフトを保存
  const saveDraft = useCallback((
    formData: FormData,
    customizeSettings: CustomizeSettings,
    templateId: string
  ) => {
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
    safeSetItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
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
      let updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      
      // 保存を試みる
      if (!safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))) {
        // 容量超過の場合、サムネイルを削除して再試行
        const withoutThumbnails = updated.map(item => ({
          ...item,
          thumbnailDataUrl: undefined,
        }));
        
        if (!safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(withoutThumbnails))) {
          // それでもダメなら古い履歴を半分削除
          const reduced = withoutThumbnails.slice(0, Math.max(1, Math.floor(withoutThumbnails.length / 2)));
          if (!safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(reduced))) {
            // 最後の手段：履歴をクリア
            try {
              localStorage.removeItem(STORAGE_KEYS.HISTORY);
            } catch {
              // 無視
            }
            return [{ ...newItem, thumbnailDataUrl: undefined }];
          }
          return reduced;
        }
        return withoutThumbnails;
      }
      
      return updated;
    });
  }, []);

  // 履歴から削除
  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 履歴をクリア
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {
      // 無視
    }
  }, []);

  // カスタムテンプレートを保存
  const saveCustomTemplate = useCallback((
    name: string,
    customizeSettings: CustomizeSettings,
    templateId: string
  ) => {
    const newTemplate: CustomTemplate = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      customizeSettings,
      templateId,
      createdAt: Date.now(),
    };

    let savedTemplate: CustomTemplate | null = newTemplate;

    setCustomTemplates(prev => {
      const updated = [newTemplate, ...prev].slice(0, 10);
      if (!safeSetItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(updated))) {
        // 容量超過の場合、古いテンプレートを削除
        const reduced = updated.slice(0, 5);
        if (!safeSetItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(reduced))) {
          savedTemplate = null;
          return prev;
        }
        return reduced;
      }
      return updated;
    });

    return savedTemplate;
  }, []);

  // カスタムテンプレートを削除
  const removeCustomTemplate = useCallback((id: string) => {
    setCustomTemplates(prev => {
      const updated = prev.filter(t => t.id !== id);
      safeSetItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(updated));
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
