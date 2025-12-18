import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormData, Template, CustomizeSettings, Sticker, ImagePosition } from './types';
import { defaultTemplate, getTemplateById } from './templates';
import { DEFAULT_CUSTOMIZE_SETTINGS, DEFAULT_IMAGE_POSITION } from './types';
import { useCanvasGenerator } from './hooks/useCanvasGenerator';
import { useValidation } from './hooks/useValidation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLocalStorage, type HistoryItem, type CustomTemplate } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { TemplateSelector } from './components/TemplateSelector';
import { Preview } from './components/Preview';
import { DownloadButton } from './components/DownloadButton';
import { CustomizeSettingsPanel } from './components/CustomizeSettings';
import { HistoryPanel } from './components/HistoryPanel';
import { StickerPicker } from './components/StickerPicker';
import { SplitTimeInput, type SplitTime } from './components/SplitTimeInput';
import { Onboarding } from './components/Onboarding';
import { LoadingOverlay } from './components/Skeleton';

// 初期フォームデータ
const initialFormData: FormData = {
  eventName: '',
  eventType: '',
  record: '',
  backgroundImage: null,
  comment: '',
};

function App() {
  // トースト通知
  const toast = useToast();

  // バリデーション
  const validation = useValidation();

  // LocalStorage
  const storage = useLocalStorage();

  // フォームデータの状態
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // 選択中のテンプレート
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultTemplate);

  // カスタマイズ設定
  const [customizeSettings, setCustomizeSettings] = useState<CustomizeSettings>(DEFAULT_CUSTOMIZE_SETTINGS);

  // 画像位置
  const [imagePosition, setImagePosition] = useState<ImagePosition>(DEFAULT_IMAGE_POSITION);

  // ステッカー
  const [stickers, setStickers] = useState<Sticker[]>([]);

  // スプリットタイム
  const [splits, setSplits] = useState<SplitTime[]>([]);

  // アンドゥ/リドゥ用の履歴
  const [undoStack, setUndoStack] = useState<Array<{
    formData: FormData;
    customizeSettings: CustomizeSettings;
    templateId: string;
  }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{
    formData: FormData;
    customizeSettings: CustomizeSettings;
    templateId: string;
  }>>([]);

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);

  // 初回ロード時にドラフトを復元
  useEffect(() => {
    if (storage.isLoaded) {
      const draft = storage.loadDraft();
      if (draft) {
        setFormData(prev => ({
          ...prev,
          eventName: draft.formData.eventName,
          eventType: draft.formData.eventType,
          record: draft.formData.record,
          comment: draft.formData.comment,
        }));
        setCustomizeSettings(draft.customizeSettings);
        setSelectedTemplate(draft.template);
        toast.info('前回の入力を復元しました');
      }
    }
  }, [storage.isLoaded]);

  // ドラフト自動保存（デバウンス）
  useEffect(() => {
    if (!storage.isLoaded) return;
    
    const timer = setTimeout(() => {
      storage.saveDraft(formData, customizeSettings, selectedTemplate.id);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, customizeSettings, selectedTemplate.id, storage.isLoaded]);

  // アンドゥ用の状態保存
  const saveStateForUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-49), {
      formData: { ...formData },
      customizeSettings: { ...customizeSettings },
      templateId: selectedTemplate.id,
    }]);
    setRedoStack([]);
  }, [formData, customizeSettings, selectedTemplate.id]);
  
  // テンプレート選択の更新
  const handleTemplateSelect = useCallback((template: Template) => {
    saveStateForUndo();
    setSelectedTemplate(template);
    // テンプレートに合わせた推奨設定を適用
    if (template.id === 'elegant') {
      setCustomizeSettings(prev => ({ 
        ...prev, 
        textColor: '#0a0a0a', 
        grayscale: 20, 
        brightness: 120,
        textLayout: undefined,
      }));
    } else if (template.id === 'cyber') {
      setCustomizeSettings(prev => ({ 
        ...prev, 
        textColor: '#00f2ff', 
        grayscale: 80, 
        brightness: 80, 
        contrast: 120,
        textLayout: undefined,
      }));
    } else if (template.id === 'gold') {
      setCustomizeSettings(prev => ({ 
        ...prev, 
        textColor: '#fbbf24',
        brightness: 90,
        contrast: 110,
        textLayout: undefined,
      }));
    } else if (template.id === 'retro') {
      setCustomizeSettings(prev => ({ 
        ...prev, 
        textColor: '#f97316',
        grayscale: 10,
        brightness: 95,
        contrast: 115,
        textLayout: undefined,
      }));
    } else if (template.id === 'pastel') {
      setCustomizeSettings(prev => ({ 
        ...prev, 
        textColor: '#fef3c7',
        brightness: 110,
        contrast: 90,
        textLayout: undefined,
      }));
    } else {
      setCustomizeSettings(prev => ({ 
        ...prev, 
        textColor: '#ffffff',
        grayscale: 0,
        brightness: 100,
        contrast: 100,
        textLayout: undefined,
      }));
    }
  }, [saveStateForUndo]);

  // 設定パネルの開閉状態
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  // 背景画像のプレビューURL
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!formData.backgroundImage) {
      setBackgroundPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formData.backgroundImage);
    setBackgroundPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.backgroundImage]);

  // フォームデータの更新
  const handleFormChange = useCallback((data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // カスタマイズ設定の更新
  const handleSettingsChange = useCallback((settings: Partial<CustomizeSettings>) => {
    setCustomizeSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // データの全リセット
  const handleReset = useCallback(() => {
    if (window.confirm('入力をすべてクリアしますか？')) {
      saveStateForUndo();
      setFormData(initialFormData);
      setCustomizeSettings(DEFAULT_CUSTOMIZE_SETTINGS);
      setSelectedTemplate(defaultTemplate);
      setImagePosition(DEFAULT_IMAGE_POSITION);
      setStickers([]);
      setSplits([]);
      validation.clearAllErrors();
      storage.clearDraft();
      toast.success('入力をクリアしました');
    }
  }, [validation, toast, saveStateForUndo, storage]);

  // アンドゥ
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, {
      formData: { ...formData },
      customizeSettings: { ...customizeSettings },
      templateId: selectedTemplate.id,
    }]);
    setUndoStack(prev => prev.slice(0, -1));
    
    setFormData(lastState.formData);
    setCustomizeSettings(lastState.customizeSettings);
    const template = getTemplateById(lastState.templateId);
    if (template) setSelectedTemplate(template);
    
    toast.info('元に戻しました');
  }, [undoStack, formData, customizeSettings, selectedTemplate.id, toast]);

  // リドゥ
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, {
      formData: { ...formData },
      customizeSettings: { ...customizeSettings },
      templateId: selectedTemplate.id,
    }]);
    setRedoStack(prev => prev.slice(0, -1));
    
    setFormData(nextState.formData);
    setCustomizeSettings(nextState.customizeSettings);
    const template = getTemplateById(nextState.templateId);
    if (template) setSelectedTemplate(template);
    
    toast.info('やり直しました');
  }, [redoStack, formData, customizeSettings, selectedTemplate.id, toast]);

  // Canvas生成フック
  const { canvasRef, isGenerating, isReady, hasBackgroundImage, downloadImage, shareImage, generateImage } = useCanvasGenerator({
    formData,
    template: selectedTemplate,
    backgroundImageUrl: backgroundPreview,
    customizeSettings,
    imagePosition,
    stickers,
  });

  // ダウンロード処理（バリデーション付き）
  const handleDownload = useCallback(async () => {
    if (!validation.validateForm(formData)) {
      toast.error('必須項目を入力してください');
      return;
    }
    
    setIsLoading(true);
    try {
      await downloadImage();
      // 履歴に追加
      const thumbnail = await generateImage();
      storage.addToHistory(formData, customizeSettings, selectedTemplate.id, thumbnail || undefined);
      toast.success('画像をダウンロードしました');
    } catch (error) {
      toast.error('画像のダウンロードに失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validation, downloadImage, toast, generateImage, storage, customizeSettings, selectedTemplate.id]);

  // シェア処理（バリデーション付き）
  const handleShare = useCallback(async () => {
    if (!validation.validateForm(formData)) {
      toast.error('必須項目を入力してください');
      return;
    }
    
    setIsLoading(true);
    try {
      await shareImage();
      // 履歴に追加
      const thumbnail = await generateImage();
      storage.addToHistory(formData, customizeSettings, selectedTemplate.id, thumbnail || undefined);
      toast.success('画像をシェアしました');
    } catch (error) {
      toast.error('画像のシェアに失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validation, shareImage, toast, generateImage, storage, customizeSettings, selectedTemplate.id]);

  // 履歴から読み込み
  const handleLoadHistory = useCallback((item: HistoryItem) => {
    saveStateForUndo();
    setFormData(prev => ({
      ...prev,
      eventName: item.formData.eventName,
      eventType: item.formData.eventType,
      record: item.formData.record,
      comment: item.formData.comment,
    }));
    setCustomizeSettings(item.customizeSettings);
    const template = getTemplateById(item.templateId);
    if (template) setSelectedTemplate(template);
    toast.success('履歴を読み込みました');
  }, [saveStateForUndo, toast]);

  // カスタムテンプレートを保存
  const handleSaveCustomTemplate = useCallback(() => {
    const name = window.prompt('設定の名前を入力してください', `カスタム ${new Date().toLocaleDateString('ja-JP')}`);
    if (!name) return;
    
    const saved = storage.saveCustomTemplate(name, customizeSettings, selectedTemplate.id);
    if (saved) {
      toast.success('設定を保存しました');
    } else {
      toast.error('保存に失敗しました');
    }
  }, [storage, customizeSettings, selectedTemplate.id, toast]);

  // カスタムテンプレートを読み込み
  const handleLoadCustomTemplate = useCallback((template: CustomTemplate) => {
    saveStateForUndo();
    setCustomizeSettings(template.customizeSettings);
    const baseTemplate = getTemplateById(template.templateId);
    if (baseTemplate) setSelectedTemplate(baseTemplate);
    toast.success('設定を適用しました');
  }, [saveStateForUndo, toast]);

  // エラーオブジェクトを構築
  const formErrors = useMemo(() => ({
    eventName: validation.getError('eventName'),
    eventType: validation.getError('eventType'),
    record: validation.getError('record'),
    backgroundImage: validation.getError('backgroundImage'),
    comment: validation.getError('comment'),
  }), [validation]);

  // キーボードショートカット
  useKeyboardShortcuts({
    onDownload: isReady && !isGenerating ? handleDownload : undefined,
    onReset: handleReset,
    onShare: isReady && !isGenerating ? handleShare : undefined,
    onUndo: undoStack.length > 0 ? handleUndo : undefined,
    onRedo: redoStack.length > 0 ? handleRedo : undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* オンボーディング */}
      <Onboarding />

      {/* トースト通知 */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingOverlay message="画像を生成中..." />
        </div>
      )}

      {/* ヘッダー */}
      <Header />

      {/* アンドゥ/リドゥボタン */}
      <div className="fixed bottom-4 left-4 z-40 flex gap-2">
        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="p-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
          title="元に戻す (⌘Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className="p-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
          title="やり直す (⌘⇧Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 pb-12 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 左カラム：入力フォーム */}
          <div className="order-2 lg:order-1 space-y-6">
            {/* リザルト情報 */}
            <div className="bg-surface/50 rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  リザルト・練習情報
                </h2>
                <button
                  onClick={handleReset}
                  className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  リセット
                </button>
              </div>
              
              <InputForm
                formData={formData}
                onFormChange={handleFormChange}
                backgroundPreview={backgroundPreview}
                errors={formErrors}
                onErrorClear={validation.clearError}
                onError={toast.error}
              />

              {/* スプリットタイム入力 */}
              <div className="mt-4 pt-4 border-t border-border">
                <SplitTimeInput
                  splits={splits}
                  onSplitsChange={setSplits}
                />
              </div>

              {/* テンプレート選択 */}
              <div className="mt-6 pt-6 border-t border-border template-selector">
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateSelect}
                />
              </div>
            </div>

            {/* カスタマイズ設定 */}
            <div className="bg-surface/50 rounded-2xl border border-border overflow-hidden customize-panel">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-text-primary hover:bg-surface-hover transition-colors"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  カスタマイズ
                </h2>
                <svg 
                  className={`w-5 h-5 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isSettingsOpen && (
                <div className="px-6 pb-6 space-y-6">
                  <CustomizeSettingsPanel
                    settings={customizeSettings}
                    onSettingsChange={handleSettingsChange}
                  />

                  {/* 画像位置調整 */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      画像位置調整
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-16">拡大率</span>
                        <input
                          type="range"
                          min="100"
                          max="200"
                          value={imagePosition.scale * 100}
                          onChange={(e) => setImagePosition(prev => ({ ...prev, scale: Number(e.target.value) / 100 }))}
                          className="flex-1 h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                        <span className="text-xs text-accent font-medium w-12 text-right">
                          {Math.round(imagePosition.scale * 100)}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImagePosition(DEFAULT_IMAGE_POSITION)}
                        className="text-xs text-text-muted hover:text-accent transition-colors"
                      >
                        位置をリセット
                      </button>
                    </div>
                  </div>

                  {/* ステッカー・ロゴ */}
                  <div className="pt-4 border-t border-border">
                    <StickerPicker
                      stickers={stickers}
                      onStickersChange={setStickers}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 履歴・保存パネル */}
            <HistoryPanel
              history={storage.history}
              customTemplates={storage.customTemplates}
              onLoadHistory={handleLoadHistory}
              onDeleteHistory={storage.removeFromHistory}
              onClearHistory={storage.clearHistory}
              onLoadCustomTemplate={handleLoadCustomTemplate}
              onDeleteCustomTemplate={storage.removeCustomTemplate}
              onSaveCustomTemplate={handleSaveCustomTemplate}
            />
          </div>

          {/* 右カラム：プレビュー＆ダウンロード */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-8 lg:self-start">
            <div className="space-y-6">
              {/* プレビュー */}
              <Preview 
                canvasRef={canvasRef} 
                hasBackgroundImage={hasBackgroundImage}
                outputSizeId={customizeSettings.outputSizeId}
                formData={formData}
                textLayout={customizeSettings.textLayout}
                onLayoutChange={(layout) => setCustomizeSettings(prev => ({ ...prev, textLayout: layout }))}
              />

              {/* ダウンロードボタン */}
              <div className="download-button">
                <DownloadButton
                  onDownload={handleDownload}
                  onShare={handleShare}
                  isReady={isReady}
                  isGenerating={isGenerating || isLoading}
                />
              </div>

              {/* 使い方ヒント */}
              {!isReady && (
                <div className="text-center text-sm text-text-muted bg-surface/30 rounded-lg p-4">
                  <p className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    必須項目：記録・背景画像（リザルト・練習どちらでも可）
                  </p>
                </div>
              )}

              {/* キーボードショートカット */}
              <div className="text-xs text-text-muted/60 space-y-1 bg-surface/30 rounded-lg p-3">
                <p className="font-medium text-text-muted mb-2">ショートカット</p>
                <div className="grid grid-cols-2 gap-1">
                  <span>⌘+S: ダウンロード</span>
                  <span>⌘+⇧+S: シェア</span>
                  <span>⌘+Z: 元に戻す</span>
                  <span>⌘+⇧+Z: やり直す</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="py-8 text-center border-t border-border">
        <p className="text-text-muted/60 text-xs">
          © 2025 TIME FRAME
        </p>
      </footer>
    </div>
  );
}

export default App;
