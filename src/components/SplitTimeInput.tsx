import { useState, useCallback } from 'react';
import { formatSplitsToText, type SplitTime } from '../utils/splitTime';

interface SplitTimeInputProps {
  splits: SplitTime[];
  onSplitsChange: (splits: SplitTime[]) => void;
}

export function SplitTimeInput({ splits, onSplitsChange }: SplitTimeInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [presetType, setPresetType] = useState<'1000m' | '400m' | 'custom'>('1000m');
  const [lapCount, setLapCount] = useState(5);

  // スプリットを追加
  const addSplit = useCallback(() => {
    const newSplit: SplitTime = {
      id: `split-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      lap: splits.length + 1,
      time: '',
    };
    onSplitsChange([...splits, newSplit]);
  }, [splits, onSplitsChange]);

  // スプリットを削除
  const removeSplit = useCallback((id: string) => {
    const updated = splits
      .filter(s => s.id !== id)
      .map((s, index) => ({ ...s, lap: index + 1 }));
    onSplitsChange(updated);
  }, [splits, onSplitsChange]);

  // スプリットを更新
  const updateSplit = useCallback((id: string, time: string) => {
    onSplitsChange(splits.map(s => s.id === id ? { ...s, time } : s));
  }, [splits, onSplitsChange]);

  // プリセットで初期化
  const initializeWithPreset = useCallback(() => {
    const count = presetType === 'custom' ? lapCount : (presetType === '1000m' ? 5 : 10);
    const newSplits: SplitTime[] = Array.from({ length: count }, (_, i) => ({
      id: `split-${Date.now()}-${i}`,
      lap: i + 1,
      time: '',
    }));
    onSplitsChange(newSplits);
  }, [presetType, lapCount, onSplitsChange]);

  // 全てクリア
  const clearAll = useCallback(() => {
    onSplitsChange([]);
  }, [onSplitsChange]);

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          スプリット/ラップタイム
          {splits.length > 0 && (
            <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">
              {splits.filter(s => s.time.trim()).length}/{splits.length}
            </span>
          )}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {/* プリセット選択 */}
          {splits.length === 0 && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPresetType('1000m')}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors
                    ${presetType === '1000m'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-accent/50'}`}
                >
                  1000m × 5
                </button>
                <button
                  type="button"
                  onClick={() => setPresetType('400m')}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors
                    ${presetType === '400m'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-accent/50'}`}
                >
                  400m × 10
                </button>
                <button
                  type="button"
                  onClick={() => setPresetType('custom')}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors
                    ${presetType === 'custom'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-accent/50'}`}
                >
                  カスタム
                </button>
              </div>

              {presetType === 'custom' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">本数:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={lapCount}
                    onChange={(e) => setLapCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                    className="w-16 px-2 py-1 bg-surface border border-border rounded text-text-primary text-sm"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={initializeWithPreset}
                className="w-full px-3 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors"
              >
                スプリット入力を開始
              </button>
            </div>
          )}

          {/* スプリット入力欄 */}
          {splits.length > 0 && (
            <div className="space-y-2">
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {splits.map((split) => (
                  <div key={split.id} className="flex items-center gap-2">
                    <span className="w-8 text-xs text-text-muted text-right">
                      {split.lap}本
                    </span>
                    <input
                      type="text"
                      value={split.time}
                      onChange={(e) => updateSplit(split.id, e.target.value)}
                      placeholder="2:48"
                      className="flex-1 px-2 py-1.5 bg-surface border border-border rounded text-text-primary text-sm font-mono
                                 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={() => removeSplit(split.id)}
                      className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* アクションボタン */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={addSplit}
                  className="flex-1 px-2 py-1.5 text-xs text-accent border border-accent/30 rounded hover:bg-accent/10 transition-colors"
                >
                  + 追加
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex-1 px-2 py-1.5 text-xs text-text-muted border border-border rounded hover:bg-surface-hover transition-colors"
                >
                  クリア
                </button>
              </div>

              {/* プレビュー */}
              {splits.some(s => s.time.trim()) && (
                <div className="p-2 bg-surface rounded-lg">
                  <div className="text-xs text-text-muted mb-1">プレビュー:</div>
                  <div className="text-sm text-text-primary font-mono">
                    {formatSplitsToText(splits) || '-'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ヒント */}
          <p className="text-xs text-text-muted/60 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            記録欄にカンマ区切りで自動反映されます
          </p>
        </div>
      )}
    </div>
  );
}

// Re-export type for convenience
export type { SplitTime };
