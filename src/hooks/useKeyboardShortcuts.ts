import { useEffect } from 'react';

interface KeyboardShortcuts {
  onDownload?: () => void;
  onReset?: () => void;
  onShare?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardShortcuts({ onDownload, onReset, onShare, onUndo, onRedo }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: ダウンロード
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 's' && onDownload) {
        e.preventDefault();
        onDownload();
        return;
      }

      // Ctrl/Cmd + Shift + S: シェア
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S' && onShare) {
        e.preventDefault();
        onShare();
        return;
      }

      // Ctrl/Cmd + Shift + R: リセット
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R' && onReset) {
        e.preventDefault();
        onReset();
        return;
      }

      // Ctrl/Cmd + Z: アンドゥ
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z' && onUndo) {
        e.preventDefault();
        onUndo();
        return;
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: リドゥ
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        if (onRedo) {
          e.preventDefault();
          onRedo();
        }
        return;
      }

      // Ctrl/Cmd + Enter: ダウンロード（代替）
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onDownload) {
        e.preventDefault();
        onDownload();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDownload, onReset, onShare, onUndo, onRedo]);
}
