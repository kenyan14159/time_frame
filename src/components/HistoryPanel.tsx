import { useState } from 'react';
import type { HistoryItem, CustomTemplate } from '../hooks/useLocalStorage';
import { getTemplateById } from '../templates';

interface HistoryPanelProps {
  history: HistoryItem[];
  customTemplates: CustomTemplate[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onLoadCustomTemplate: (template: CustomTemplate) => void;
  onDeleteCustomTemplate: (id: string) => void;
  onSaveCustomTemplate: () => void;
}

export function HistoryPanel({
  history,
  customTemplates,
  onLoadHistory,
  onDeleteHistory,
  onClearHistory,
  onLoadCustomTemplate,
  onDeleteCustomTemplate,
  onSaveCustomTemplate,
}: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history');
  const [isExpanded, setIsExpanded] = useState(false);

  // 日付フォーマット
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) return 'たった今';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}時間前`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}日前`;
    
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-surface/50 rounded-2xl border border-border overflow-hidden">
      {/* ヘッダー */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-text-primary hover:bg-surface-hover transition-colors"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          履歴・保存
          {(history.length > 0 || customTemplates.length > 0) && (
            <span className="bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full">
              {history.length + customTemplates.length}
            </span>
          )}
        </h2>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* タブ */}
          <div className="flex gap-1 p-1 bg-surface rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${activeTab === 'history' 
                  ? 'bg-accent text-white' 
                  : 'text-text-muted hover:text-text-secondary'}`}
            >
              履歴
              {history.length > 0 && (
                <span className="ml-1 text-xs opacity-70">({history.length})</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${activeTab === 'templates' 
                  ? 'bg-accent text-white' 
                  : 'text-text-muted hover:text-text-secondary'}`}
            >
              保存済み
              {customTemplates.length > 0 && (
                <span className="ml-1 text-xs opacity-70">({customTemplates.length})</span>
              )}
            </button>
          </div>

          {/* 履歴タブ */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm">履歴がありません</p>
                  <p className="text-xs mt-1 opacity-70">画像を生成すると自動保存されます</p>
                </div>
              ) : (
                <>
                  {/* クリアボタン */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onClearHistory}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      全て削除
                    </button>
                  </div>

                  {/* 履歴リスト */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {history.map(item => {
                      const template = getTemplateById(item.templateId);
                      return (
                        <div
                          key={item.id}
                          className="group flex items-center gap-3 p-3 bg-surface rounded-lg border border-border hover:border-accent/50 transition-colors"
                        >
                          {/* サムネイル */}
                          {item.thumbnailDataUrl ? (
                            <img 
                              src={item.thumbnailDataUrl} 
                              alt="" 
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div 
                              className="w-12 h-12 rounded flex items-center justify-center"
                              style={{ 
                                backgroundColor: template?.style.accentColor || '#3b82f6',
                                opacity: 0.3,
                              }}
                            >
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          {/* 情報 */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">
                              {item.formData.record || '(記録なし)'}
                            </div>
                            <div className="text-xs text-text-muted truncate">
                              {item.formData.eventName || item.formData.eventType || '(タイトルなし)'}
                            </div>
                            <div className="text-xs text-text-muted/60 mt-0.5">
                              {formatDate(item.createdAt)} • {template?.name || 'テンプレート'}
                            </div>
                          </div>

                          {/* アクション */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onLoadHistory(item)}
                              className="p-1.5 text-accent hover:bg-accent/10 rounded transition-colors"
                              title="読み込む"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteHistory(item.id)}
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                              title="削除"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 保存済みテンプレートタブ */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              {/* 保存ボタン */}
              <button
                type="button"
                onClick={onSaveCustomTemplate}
                className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                現在の設定を保存
              </button>

              {customTemplates.length === 0 ? (
                <div className="text-center py-6 text-text-muted">
                  <p className="text-sm">保存済み設定がありません</p>
                  <p className="text-xs mt-1 opacity-70">お気に入りの設定を保存しましょう</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {customTemplates.map(template => {
                    const baseTemplate = getTemplateById(template.templateId);
                    return (
                      <div
                        key={template.id}
                        className="group flex items-center gap-3 p-3 bg-surface rounded-lg border border-border hover:border-accent/50 transition-colors"
                      >
                        {/* アイコン */}
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: template.customizeSettings.textColor + '20' }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: template.customizeSettings.textColor }}
                          />
                        </div>

                        {/* 情報 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">
                            {template.name}
                          </div>
                          <div className="text-xs text-text-muted">
                            {baseTemplate?.name || 'カスタム'} • {formatDate(template.createdAt)}
                          </div>
                        </div>

                        {/* アクション */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onLoadCustomTemplate(template)}
                            className="p-1.5 text-accent hover:bg-accent/10 rounded transition-colors"
                            title="適用"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCustomTemplate(template.id)}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

