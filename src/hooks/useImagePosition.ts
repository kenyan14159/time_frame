import { useState, useCallback, useRef } from 'react';

// 画像位置の型
export interface ImagePosition {
  x: number; // -1 to 1 (0 = center)
  y: number; // -1 to 1 (0 = center)
  scale: number; // 1 = fit, > 1 = zoom in
}

// デフォルトの画像位置
export const DEFAULT_IMAGE_POSITION: ImagePosition = {
  x: 0,
  y: 0,
  scale: 1,
};

interface UseImagePositionProps {
  onPositionChange?: (position: ImagePosition) => void;
}

export function useImagePosition({ onPositionChange }: UseImagePositionProps = {}) {
  const [position, setPosition] = useState<ImagePosition>(DEFAULT_IMAGE_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  // 位置を更新
  const updatePosition = useCallback((newPosition: Partial<ImagePosition>) => {
    setPosition(prev => {
      const updated = { ...prev, ...newPosition };
      // 境界チェック
      updated.x = Math.max(-1, Math.min(1, updated.x));
      updated.y = Math.max(-1, Math.min(1, updated.y));
      updated.scale = Math.max(1, Math.min(3, updated.scale));
      onPositionChange?.(updated);
      return updated;
    });
  }, [onPositionChange]);

  // ドラッグ開始
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position.x, position.y]);

  // ドラッグ中
  const handleDragMove = useCallback((clientX: number, clientY: number, containerWidth: number, containerHeight: number) => {
    if (!isDragging || !dragStartRef.current) return;

    const deltaX = (clientX - dragStartRef.current.x) / containerWidth * 2;
    const deltaY = (clientY - dragStartRef.current.y) / containerHeight * 2;

    updatePosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  }, [isDragging, updatePosition]);

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // マウスイベントハンドラ
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleDragMove(e.clientX, e.clientY, rect.width, rect.height);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // タッチイベントハンドラ
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY, rect.width, rect.height);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // スケール変更
  const setScale = useCallback((scale: number) => {
    updatePosition({ scale });
  }, [updatePosition]);

  // リセット
  const resetPosition = useCallback(() => {
    setPosition(DEFAULT_IMAGE_POSITION);
    onPositionChange?.(DEFAULT_IMAGE_POSITION);
  }, [onPositionChange]);

  return {
    position,
    isDragging,
    updatePosition,
    setScale,
    resetPosition,
    // マウスイベント
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    // タッチイベント
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

