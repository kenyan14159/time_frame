import { useState, useEffect, type RefObject } from 'react';
import type { OutputSizeId, FormData, TextLayoutSettings, Sticker, ImagePosition } from '../types';
import { getOutputSize } from '../types';
import { useTextDrag } from '../hooks/useTextDrag';

interface PreviewProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasBackgroundImage: boolean;
  outputSizeId: OutputSizeId;
  formData: FormData;
  textLayout: TextLayoutSettings | undefined;
  onLayoutChange: (layout: TextLayoutSettings) => void;
  stickers?: Sticker[];
  onStickersChange?: (stickers: Sticker[]) => void;
  imagePosition?: ImagePosition;
  onImagePositionChange?: (position: ImagePosition) => void;
}

export function Preview({ 
  canvasRef, 
  hasBackgroundImage, 
  outputSizeId,
  formData,
  textLayout,
  onLayoutChange,
  stickers = [],
  onStickersChange,
  imagePosition,
  onImagePositionChange,
}: PreviewProps) {
  const outputSize = getOutputSize(outputSizeId);
  const aspectRatio = outputSize.width / outputSize.height;
  
  // ドラッグヒントの表示状態
  const [showDragHint, setShowDragHint] = useState(true);
  
  // 背景画像が表示されたらヒントを数秒後に消す
  useEffect(() => {
    if (hasBackgroundImage && showDragHint) {
      const timer = setTimeout(() => {
        setShowDragHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasBackgroundImage, showDragHint]);

  // ドラッグ機能（テキスト+ステッカー+背景画像）
  const { 
    dragging, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useTextDrag({
    canvasRef,
    formData,
    textLayout,
    onLayoutChange,
    canvasWidth: outputSize.width,
    canvasHeight: outputSize.height,
    stickers,
    onStickersChange,
    imagePosition,
    onImagePositionChange,
  });

  return (
    <div className="w-full">
      <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        プレビュー
      </h2>
      
      <div 
        className="relative w-full bg-surface rounded-xl overflow-hidden border border-border"
        style={{ 
          aspectRatio: aspectRatio,
          maxHeight: aspectRatio < 1 ? '500px' : undefined
        }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain ${dragging ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
          style={{ display: hasBackgroundImage ? 'block' : 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
        
        {/* ドラッグヒント */}
        {hasBackgroundImage && showDragHint && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in"
            onClick={() => setShowDragHint(false)}
          >
            <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
              <svg className="w-5 h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-sm font-medium">ドラッグで位置を調整できます</span>
            </div>
          </div>
        )}
        
        {/* プレースホルダー */}
        {!hasBackgroundImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-center px-4">
              左の項目を入力すると
              <br />
              ここにプレビューが表示されます
            </p>
          </div>
        )}
      </div>
      
      {/* サイズ情報 */}
      <p className="mt-2 text-xs text-text-muted text-center flex items-center justify-center gap-2">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        {outputSize.name}: {outputSize.width} × {outputSize.height} px
      </p>
    </div>
  );
}
