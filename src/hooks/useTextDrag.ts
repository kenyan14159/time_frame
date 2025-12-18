import { useState, useCallback, useRef } from 'react';
import type { TextLayoutSettings, Sticker, ImagePosition } from '../types';

interface UseTextDragProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  formData: {
    eventName: string;
    eventType: string;
    record: string;
    comment: string;
  };
  textLayout: TextLayoutSettings | undefined;
  onLayoutChange: (layout: TextLayoutSettings) => void;
  canvasWidth: number;
  canvasHeight: number;
  stickers?: Sticker[];
  onStickersChange?: (stickers: Sticker[]) => void;
  imagePosition?: ImagePosition;
  onImagePositionChange?: (position: ImagePosition) => void;
}

type DragTarget = 
  | { type: 'text'; field: string } 
  | { type: 'sticker'; id: string } 
  | { type: 'background' }
  | null;

export function useTextDrag({
  canvasRef,
  formData,
  textLayout,
  onLayoutChange,
  canvasWidth,
  canvasHeight,
  stickers = [],
  onStickersChange,
  imagePosition,
  onImagePositionChange,
}: UseTextDragProps) {
  const [dragging, setDragging] = useState<DragTarget>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragStartLayout = useRef<TextLayoutSettings | null>(null);
  const dragStartSticker = useRef<Sticker | null>(null);
  const dragStartImagePos = useRef<ImagePosition | null>(null);

  // テキストの位置を取得（Canvas座標系）
  const getTextPosition = useCallback((field: string): { x: number; y: number } => {
    const yDefaults: Record<string, number> = {
      eventName: 0.3,
      eventType: 0.4,
      record: 0.5,
      comment: 0.7,
    };
    const xRatio = (textLayout?.[`${field}X` as keyof TextLayoutSettings] as number | undefined) ?? 0.5;
    const yRatio = (textLayout?.[`${field}Y` as keyof TextLayoutSettings] as number | undefined) ?? yDefaults[field] ?? 0.5;
    return { x: canvasWidth * xRatio, y: canvasHeight * yRatio };
  }, [textLayout, canvasWidth, canvasHeight]);

  // マウス/タッチ位置をCanvas座標に変換
  const getCanvasCoordinates = useCallback((
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // ステッカーがクリックされたかチェック
  const getClickedSticker = useCallback((
    x: number,
    y: number
  ): Sticker | null => {
    const scaleFactor = canvasWidth / 1080;
    
    // 逆順でチェック（上に表示されているものを優先）
    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i];
      const stickerX = sticker.x * canvasWidth;
      const stickerY = sticker.y * canvasHeight;
      const size = sticker.size * scaleFactor;
      const hitRadius = size / 2 + 10; // 少し余裕を持たせる
      
      const distance = Math.sqrt(
        Math.pow(x - stickerX, 2) + Math.pow(y - stickerY, 2)
      );
      
      if (distance < hitRadius) {
        return sticker;
      }
    }
    return null;
  }, [stickers, canvasWidth, canvasHeight]);

  // テキストがクリックされたかチェック（X座標とY座標の近くかどうか）
  const getClickedField = useCallback((
    x: number,
    y: number
  ): string | null => {
    const fields = ['eventName', 'eventType', 'record', 'comment'] as const;
    const thresholdY = canvasHeight * 0.05; // Y方向の閾値（5%）
    const thresholdX = canvasWidth * 0.3; // X方向の閾値（30%、テキストの幅を考慮）

    for (const field of fields) {
      if (!formData[field]) continue;
      const pos = getTextPosition(field);
      if (Math.abs(y - pos.y) < thresholdY && Math.abs(x - pos.x) < thresholdX) {
        return field;
      }
    }
    return null;
  }, [formData, getTextPosition, canvasWidth, canvasHeight]);

  // クリックされた対象を取得（ステッカー > テキスト > 背景の優先順）
  const getClickedTarget = useCallback((
    x: number,
    y: number
  ): DragTarget => {
    // ステッカーを先にチェック（上に表示されているため）
    const sticker = getClickedSticker(x, y);
    if (sticker) {
      return { type: 'sticker', id: sticker.id };
    }
    
    // テキストをチェック
    const field = getClickedField(x, y);
    if (field) {
      return { type: 'text', field };
    }
    
    // 何もなければ背景画像のドラッグ
    if (onImagePositionChange) {
      return { type: 'background' };
    }
    
    return null;
  }, [getClickedSticker, getClickedField, onImagePositionChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY, canvas);
    const target = getClickedTarget(x, y);
    
    if (target) {
      setDragging(target);
      dragStartPos.current = { x, y };
      
      if (target.type === 'text') {
        dragStartLayout.current = textLayout || {
          eventNameX: 0.5,
          eventNameY: 0.3,
          eventTypeX: 0.5,
          eventTypeY: 0.4,
          recordX: 0.5,
          recordY: 0.5,
          commentX: 0.5,
          commentY: 0.7,
          eventNameSize: 100,
          eventTypeSize: 100,
          recordSize: 100,
          commentSize: 100,
        };
      } else if (target.type === 'sticker') {
        const sticker = stickers.find(s => s.id === target.id);
        if (sticker) {
          dragStartSticker.current = { ...sticker };
        }
      } else if (target.type === 'background') {
        dragStartImagePos.current = imagePosition || { x: 0, y: 0, scale: 1 };
      }
    }
  }, [canvasRef, getCanvasCoordinates, getClickedTarget, textLayout, stickers, imagePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStartPos.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY, canvas);
    const deltaX = x - dragStartPos.current.x;
    const deltaY = y - dragStartPos.current.y;
    
    if (dragging.type === 'text' && dragStartLayout.current) {
      const field = dragging.field;
      const currentX = (dragStartLayout.current[`${field}X` as keyof TextLayoutSettings] as number | undefined) ?? 0.5;
      const currentY = dragStartLayout.current[`${field}Y` as keyof TextLayoutSettings] as number;
      
      const newXRatio = Math.max(0, Math.min(1, currentX + deltaX / canvasWidth));
      const newYRatio = Math.max(0, Math.min(1, currentY + deltaY / canvasHeight));

      const newLayout: TextLayoutSettings = {
        ...dragStartLayout.current,
        [`${field}X` as keyof TextLayoutSettings]: newXRatio,
        [`${field}Y` as keyof TextLayoutSettings]: newYRatio,
      };

      onLayoutChange(newLayout);
    } else if (dragging.type === 'sticker' && dragStartSticker.current && onStickersChange) {
      const startSticker = dragStartSticker.current;
      const newXRatio = Math.max(0, Math.min(1, startSticker.x + deltaX / canvasWidth));
      const newYRatio = Math.max(0, Math.min(1, startSticker.y + deltaY / canvasHeight));

      const updatedStickers = stickers.map(s => 
        s.id === dragging.id 
          ? { ...s, x: newXRatio, y: newYRatio }
          : s
      );

      onStickersChange(updatedStickers);
    } else if (dragging.type === 'background' && dragStartImagePos.current && onImagePositionChange) {
      // 背景画像の移動（移動方向を反転 - 画像を動かす感覚に）
      const sensitivity = 2 / Math.max(dragStartImagePos.current.scale, 1);
      const newX = Math.max(-1, Math.min(1, dragStartImagePos.current.x - (deltaX / canvasWidth) * sensitivity));
      const newY = Math.max(-1, Math.min(1, dragStartImagePos.current.y - (deltaY / canvasHeight) * sensitivity));

      onImagePositionChange({
        ...dragStartImagePos.current,
        x: newX,
        y: newY,
      });
    }
  }, [dragging, canvasRef, getCanvasCoordinates, canvasWidth, canvasHeight, onLayoutChange, stickers, onStickersChange, onImagePositionChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    dragStartPos.current = null;
    dragStartLayout.current = null;
    dragStartSticker.current = null;
    dragStartImagePos.current = null;
  }, []);

  // タッチイベント対応
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
    const target = getClickedTarget(x, y);
    
    if (target) {
      e.preventDefault(); // スクロール防止
      setDragging(target);
      dragStartPos.current = { x, y };
      
      if (target.type === 'text') {
        dragStartLayout.current = textLayout || {
          eventNameX: 0.5,
          eventNameY: 0.3,
          eventTypeX: 0.5,
          eventTypeY: 0.4,
          recordX: 0.5,
          recordY: 0.5,
          commentX: 0.5,
          commentY: 0.7,
          eventNameSize: 100,
          eventTypeSize: 100,
          recordSize: 100,
          commentSize: 100,
        };
      } else if (target.type === 'sticker') {
        const sticker = stickers.find(s => s.id === target.id);
        if (sticker) {
          dragStartSticker.current = { ...sticker };
        }
      } else if (target.type === 'background') {
        dragStartImagePos.current = imagePosition || { x: 0, y: 0, scale: 1 };
      }
    }
  }, [canvasRef, getCanvasCoordinates, getClickedTarget, textLayout, stickers, imagePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStartPos.current || e.touches.length !== 1) return;
    
    e.preventDefault(); // スクロール防止
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const { x, y } = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
    const deltaX = x - dragStartPos.current.x;
    const deltaY = y - dragStartPos.current.y;
    
    if (dragging.type === 'text' && dragStartLayout.current) {
      const field = dragging.field;
      const currentX = (dragStartLayout.current[`${field}X` as keyof TextLayoutSettings] as number | undefined) ?? 0.5;
      const currentY = dragStartLayout.current[`${field}Y` as keyof TextLayoutSettings] as number;
      
      const newXRatio = Math.max(0, Math.min(1, currentX + deltaX / canvasWidth));
      const newYRatio = Math.max(0, Math.min(1, currentY + deltaY / canvasHeight));

      const newLayout: TextLayoutSettings = {
        ...dragStartLayout.current,
        [`${field}X` as keyof TextLayoutSettings]: newXRatio,
        [`${field}Y` as keyof TextLayoutSettings]: newYRatio,
      };

      onLayoutChange(newLayout);
    } else if (dragging.type === 'sticker' && dragStartSticker.current && onStickersChange) {
      const startSticker = dragStartSticker.current;
      const newXRatio = Math.max(0, Math.min(1, startSticker.x + deltaX / canvasWidth));
      const newYRatio = Math.max(0, Math.min(1, startSticker.y + deltaY / canvasHeight));

      const updatedStickers = stickers.map(s => 
        s.id === dragging.id 
          ? { ...s, x: newXRatio, y: newYRatio }
          : s
      );

      onStickersChange(updatedStickers);
    } else if (dragging.type === 'background' && dragStartImagePos.current && onImagePositionChange) {
      // 背景画像の移動（移動方向を反転 - 画像を動かす感覚に）
      const sensitivity = 2 / Math.max(dragStartImagePos.current.scale, 1);
      const newX = Math.max(-1, Math.min(1, dragStartImagePos.current.x - (deltaX / canvasWidth) * sensitivity));
      const newY = Math.max(-1, Math.min(1, dragStartImagePos.current.y - (deltaY / canvasHeight) * sensitivity));

      onImagePositionChange({
        ...dragStartImagePos.current,
        x: newX,
        y: newY,
      });
    }
  }, [dragging, canvasRef, getCanvasCoordinates, canvasWidth, canvasHeight, onLayoutChange, stickers, onStickersChange, onImagePositionChange]);

  const handleTouchEnd = useCallback(() => {
    setDragging(null);
    dragStartPos.current = null;
    dragStartLayout.current = null;
    dragStartSticker.current = null;
    dragStartImagePos.current = null;
  }, []);

  return {
    dragging: dragging !== null,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
