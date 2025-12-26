import { useRef, useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import type { FormData } from '../types';
import { optimizeImageIfNeeded } from '../utils/imageOptimizer';

interface InputFormProps {
  formData: FormData;
  onFormChange: (data: Partial<FormData>) => void;
  backgroundPreview: string | null;
  errors?: {
    eventName?: string;
    eventType?: string;
    record?: string;
    backgroundImage?: string;
    comment?: string;
  };
  onErrorClear?: (field: keyof FormData) => void;
  onError?: (message: string) => void;
}

export function InputForm({ formData, onFormChange, backgroundPreview, errors, onErrorClear, onError }: InputFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const dragCounter = useRef(0);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // コメントは30文字制限
    if (name === 'comment' && value.length > 30) {
      return;
    }
    
    // エラーをクリア
    if (onErrorClear && errors?.[name as keyof FormData]) {
      onErrorClear(name as keyof FormData);
    }
    
    onFormChange({ [name]: value });
  };

  const handleImageFile = async (file: File, showError?: (message: string) => void): Promise<void> => {
    // 画像ファイルのみ許可
    if (!file.type.startsWith('image/')) {
      const message = '画像ファイルを選択してください';
      if (showError) {
        showError(message);
      } else if (onError) {
        onError(message);
      }
      return;
    }
    // 極端に大きい画像はブラウザが重くなるため制限
    const MAX_BYTES = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_BYTES) {
      const message = '画像サイズが大きすぎます（15MB以下にしてください）';
      if (showError) {
        showError(message);
      } else if (onError) {
        onError(message);
      }
      return;
    }
    
    // エラーをクリア
    if (onErrorClear && errors?.backgroundImage) {
      onErrorClear('backgroundImage');
    }
    
    // 画像を最適化
    setIsOptimizing(true);
    try {
      const optimizedFile = await optimizeImageIfNeeded(file, 5);
      onFormChange({ backgroundImage: optimizedFile });
      // 最適化された場合は通知（オプション）
      // if (optimizedFile.size < file.size && onError) {
      //   onError('画像を最適化しました');
      // }
    } catch (error) {
      const message = '画像の処理に失敗しました';
      if (showError) {
        showError(message);
      } else if (onError) {
        onError(message);
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageFile(file, onError);
    }
  };

  // ドラッグエンター（カウンターで子要素の出入りを管理）
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    
    // ファイルを含むドラッグのみ反応
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // ドロップを許可するために必要
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    
    // カウンターが0になったら完全に領域外
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // カウンターをリセット
    dragCounter.current = 0;
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleImageFile(files[0], onError);
    }
  }, [onError]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onFormChange({ backgroundImage: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      {/* 大会名/練習メニュー */}
      <div>
        <label htmlFor="eventName" className="block text-sm font-medium text-text-secondary mb-2">
          大会名 / 練習メニュー
        </label>
        <input
          id="eventName"
          type="text"
          name="eventName"
          value={formData.eventName}
          onChange={handleInputChange}
          placeholder="例：日体大記録会 / インターバル走"
          aria-invalid={!!errors?.eventName}
          aria-describedby={errors?.eventName ? 'eventName-error' : undefined}
          className={`w-full px-4 py-3 bg-surface border rounded-lg 
                     text-text-primary placeholder-text-muted
                     focus:outline-none focus:ring-1 focus:ring-accent
                     transition-colors
                     ${errors?.eventName ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
        />
        {errors?.eventName && (
          <p id="eventName-error" className="mt-1 text-xs text-red-400" role="alert">
            {errors.eventName}
          </p>
        )}
      </div>

      {/* 種目/場所 */}
      <div>
        <label htmlFor="eventType" className="block text-sm font-medium text-text-secondary mb-2">
          種目 / 場所
        </label>
        <input
          id="eventType"
          type="text"
          name="eventType"
          value={formData.eventType}
          onChange={handleInputChange}
          placeholder="例：10000m / ハーフマラソン / 1000m×5本 / 皇居ランニング"
          aria-invalid={!!errors?.eventType}
          aria-describedby={errors?.eventType ? 'eventType-error' : undefined}
          className={`w-full px-4 py-3 bg-surface border rounded-lg 
                     text-text-primary placeholder-text-muted
                     focus:outline-none focus:ring-1 focus:ring-accent
                     transition-colors
                     ${errors?.eventType ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
        />
        {errors?.eventType && (
          <p id="eventType-error" className="mt-1 text-xs text-red-400" role="alert">
            {errors.eventType}
          </p>
        )}
      </div>

      {/* 記録/タイム */}
      <div>
        <label htmlFor="record" className="block text-sm font-medium text-text-secondary mb-2">
          記録 / タイム <span className="text-accent">*</span>
        </label>
        <input
          id="record"
          type="text"
          name="record"
          value={formData.record}
          onChange={handleInputChange}
          placeholder="例：28:30.45 / 1:02:30 / 2:45, 2:48, 2:50..."
          aria-invalid={!!errors?.record}
          aria-describedby={errors?.record ? 'record-error' : undefined}
          className={`w-full px-4 py-3 bg-surface border rounded-lg 
                     text-text-primary placeholder-text-muted text-xl font-bold
                     focus:outline-none focus:ring-1 focus:ring-accent
                     transition-colors
                     ${errors?.record ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
        />
        {errors?.record && (
          <p id="record-error" className="mt-1 text-xs text-red-400" role="alert">
            {errors.record}
          </p>
        )}
      </div>

      {/* 一言コメント */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-text-secondary mb-2">
          一言コメント <span className="text-text-muted text-xs">（任意・最大30文字）</span>
        </label>
        <input
          id="comment"
          type="text"
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          placeholder="例：自己ベスト更新！"
          maxLength={30}
          aria-invalid={!!errors?.comment}
          aria-describedby={errors?.comment ? 'comment-error' : 'comment-counter'}
          className={`w-full px-4 py-3 bg-surface border rounded-lg 
                     text-text-primary placeholder-text-muted
                     focus:outline-none focus:ring-1 focus:ring-accent
                     transition-colors
                     ${errors?.comment ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'}`}
        />
        <div className="mt-1 flex justify-between items-center">
          {errors?.comment ? (
            <p id="comment-error" className="text-xs text-red-400" role="alert">
              {errors.comment}
            </p>
          ) : (
            <span></span>
          )}
          <span id="comment-counter" className="text-xs text-text-muted">
            {formData.comment.length}/30
          </span>
        </div>
      </div>

      {/* 背景画像 */}
      <div>
        <label htmlFor="backgroundImage" className="block text-sm font-medium text-text-secondary mb-2">
          背景画像 <span className="text-accent">*</span>
        </label>
        <input
          id="backgroundImage"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          aria-invalid={!!errors?.backgroundImage}
          aria-describedby={errors?.backgroundImage ? 'backgroundImage-error' : undefined}
          className="hidden"
        />
        
        {backgroundPreview ? (
          <div className="relative">
            {isOptimizing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                <div className="text-white text-sm flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>最適化中...</span>
                </div>
              </div>
            )}
            <div 
              onClick={handleImageClick}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              aria-label="背景画像を変更"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleImageClick();
                }
              }}
              className={`w-full h-32 rounded-lg overflow-hidden cursor-pointer 
                         border-2 transition-all
                         ${errors?.backgroundImage
                           ? 'border-red-500'
                           : isDragOver 
                             ? 'border-accent border-dashed bg-accent/5' 
                             : 'border-border hover:border-accent'}
                         ${isOptimizing ? 'opacity-50' : ''}`}
            >
              <img 
                src={backgroundPreview} 
                alt="背景プレビュー" 
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="背景画像を削除"
              className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full
                         flex items-center justify-center text-white
                         hover:bg-black transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onClick={handleImageClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="背景画像を選択"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleImageClick();
              }
            }}
            className={`w-full h-32 border-2 border-dashed rounded-lg
                       flex flex-col items-center justify-center gap-2
                       transition-all cursor-pointer
                       ${errors?.backgroundImage
                         ? 'border-red-500 bg-red-500/5'
                         : isDragOver 
                           ? 'border-accent bg-accent/5 text-accent' 
                           : 'border-border text-text-muted hover:border-accent hover:text-text-secondary'}`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">
              {isDragOver ? '画像をドロップ' : 'クリックまたはドラッグ＆ドロップ'}
            </span>
            <span className="text-xs text-text-muted">JPG, PNG, GIF対応</span>
          </div>
        )}
        {errors?.backgroundImage && (
          <p id="backgroundImage-error" className="mt-1 text-xs text-red-400" role="alert">
            {errors.backgroundImage}
          </p>
        )}
      </div>
    </div>
  );
}
