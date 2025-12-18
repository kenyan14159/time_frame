import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions {
  maxHistory?: number;
  debounceMs?: number;
}

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  // デバウンスなしで即座に保存
  saveState: () => void;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<T> {
  const { maxHistory = 50, debounceMs = 500 } = options;

  const [state, setStateInternal] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedStateRef = useRef<string>(JSON.stringify(initialState));

  // 履歴に状態を追加
  const addToHistory = useCallback((newState: T) => {
    const newStateStr = JSON.stringify(newState);
    // 同じ状態なら保存しない
    if (newStateStr === lastSavedStateRef.current) return;
    
    lastSavedStateRef.current = newStateStr;
    
    setHistory(prev => {
      // 現在位置より後の履歴を削除して新しい状態を追加
      const newHistory = [...prev.slice(0, currentIndex + 1), newState];
      // 最大履歴数を超えたら古いものを削除
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        setCurrentIndex(ci => Math.max(0, ci - 1));
        return newHistory;
      }
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex, maxHistory]);

  // 状態を更新（デバウンス付き）
  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setStateInternal(prev => {
      const resolvedState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev) 
        : newState;
      
      // デバウンスタイマーをリセット
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // デバウンス後に履歴に追加
      debounceTimerRef.current = setTimeout(() => {
        addToHistory(resolvedState);
      }, debounceMs);
      
      return resolvedState;
    });
  }, [addToHistory, debounceMs]);

  // 即座に状態を保存
  const saveState = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    addToHistory(state);
  }, [addToHistory, state]);

  // アンドゥ
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      // ペンディング中の変更を保存
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const previousState = history[newIndex];
      setStateInternal(previousState);
      lastSavedStateRef.current = JSON.stringify(previousState);
    }
  }, [currentIndex, history]);

  // リドゥ
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const nextState = history[newIndex];
      setStateInternal(nextState);
      lastSavedStateRef.current = JSON.stringify(nextState);
    }
  }, [currentIndex, history]);

  // 履歴をクリア
  const clearHistory = useCallback(() => {
    setHistory([state]);
    setCurrentIndex(0);
    lastSavedStateRef.current = JSON.stringify(state);
  }, [state]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    clearHistory,
    saveState,
  };
}
