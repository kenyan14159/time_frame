import { useState, useCallback } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { ConfirmDialog } from './ConfirmDialog';

// ステッカーの型
export interface Sticker {
  id: string;
  type: 'emoji' | 'logo' | 'custom';
  content: string; // emoji文字 or dataURL
  x: number; // 0-1
  y: number; // 0-1
  size: number; // px
  rotation: number; // degrees
}

// 利用可能な絵文字ステッカー
const EMOJI_STICKERS = [
  // 達成・祝福
  '🏆', '🥇', '🥈', '🥉', '🎉', '🎊', '⭐', '✨', '💪', '🔥',
  // ランニング関連
  '🏃', '🏃‍♂️', '🏃‍♀️', '👟', '🦶', '💨', '⏱️', '🏅',
  // 数字・記号
  '🔴', '🟢', '🔵', '⚫', '⚪', '❤️', '💙', '💚', '💛', '🖤',
  // その他
  '💯', '👏', '🙌', '✌️', '👍', '💥', '⚡', '🌟', '📍', '🚀',
];

interface StickerPickerProps {
  stickers: Sticker[];
  onStickersChange: (stickers: Sticker[]) => void;
}

export function StickerPicker({ stickers, onStickersChange }: StickerPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'emoji' | 'logo'>('emoji');
  const confirmDialog = useConfirm();

  // ステッカーを追加
  const addSticker = useCallback((type: Sticker['type'], content: string) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      content,
      x: 0.5,
      y: 0.5,
      size: 48,
      rotation: 0,
    };
    onStickersChange([...stickers, newSticker]);
  }, [stickers, onStickersChange]);

  // ステッカーを削除
  const removeSticker = useCallback((id: string) => {
    onStickersChange(stickers.filter(s => s.id !== id));
  }, [stickers, onStickersChange]);

  // ロゴファイルのアップロード
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像ファイルのみ
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // DataURLに変換
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addSticker('logo', reader.result);
      }
    };
    reader.readAsDataURL(file);

    // inputをリセット
    e.target.value = '';
  }, [addSticker]);

  // 全てクリア
  const clearAll = useCallback(async () => {
    const confirmed = await confirmDialog.confirm(
      '全てのステッカーを削除しますか？',
      '追加したステッカーがすべて削除されます。この操作は元に戻せません。',
      {
        confirmLabel: '削除',
        cancelLabel: 'キャンセル',
        confirmVariant: 'danger',
      }
    );
    if (confirmed) {
      onStickersChange([]);
    }
  }, [onStickersChange, confirmDialog]);

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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ステッカー・ロゴ
          {stickers.length > 0 && (
            <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">
              {stickers.length}
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
          {/* タブ */}
          <div className="flex gap-1 p-1 bg-surface rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('emoji')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${activeTab === 'emoji' 
                  ? 'bg-accent text-white' 
                  : 'text-text-muted hover:text-text-secondary'}`}
            >
              絵文字
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logo')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${activeTab === 'logo' 
                  ? 'bg-accent text-white' 
                  : 'text-text-muted hover:text-text-secondary'}`}
            >
              ロゴ
            </button>
          </div>

          {/* 絵文字タブ */}
          {activeTab === 'emoji' && (
            <div className="grid grid-cols-10 gap-1 p-2 bg-surface rounded-lg max-h-32 overflow-y-auto">
              {EMOJI_STICKERS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addSticker('emoji', emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-surface-hover rounded transition-colors text-lg"
                  title={`${emoji}を追加`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* ロゴタブ */}
          {activeTab === 'logo' && (
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-accent/50 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs text-text-muted">クリックしてロゴをアップロード</span>
                <span className="text-xs text-text-muted/60">PNG, JPG, SVG対応</span>
              </label>
            </div>
          )}

          {/* 追加済みステッカー一覧 */}
          {stickers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">追加済み</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  全て削除
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {stickers.map(sticker => (
                  <div
                    key={sticker.id}
                    className="relative group bg-surface rounded-lg p-2 border border-border"
                  >
                    {sticker.type === 'emoji' ? (
                      <span className="text-2xl">{sticker.content}</span>
                    ) : (
                      <img 
                        src={sticker.content} 
                        alt="Logo" 
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeSticker(sticker.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ヒント */}
          <p className="text-xs text-text-muted/60 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            プレビュー上でドラッグして位置を調整できます
          </p>
        </div>
      )}

      {/* カスタムダイアログ */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.cancel}
      />
    </div>
  );
}

