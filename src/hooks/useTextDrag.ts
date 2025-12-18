import { useState, useCallback, useRef } from 'react';
import type { TextLayoutSettings } from '../types';

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
}

export function useTextDrag({
  canvasRef,
  formData,
  textLayout,
  onLayoutChange,
  canvasWidth,
  canvasHeight,
}: UseTextDragProps) {
  const [dragging, setDragging] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragStartLayout = useRef<TextLayoutSettings | null>(null);

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

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY, canvas);
    const field = getClickedField(x, y);
    
    if (field) {
      setDragging(field);
      dragStartPos.current = { x, y };
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
    }
  }, [canvasRef, getCanvasCoordinates, getClickedField, textLayout]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStartPos.current || !dragStartLayout.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY, canvas);
    const deltaX = x - dragStartPos.current.x;
    const deltaY = y - dragStartPos.current.y;
    
    const currentX = (dragStartLayout.current[`${dragging}X` as keyof TextLayoutSettings] as number | undefined) ?? 0.5;
    const currentY = dragStartLayout.current[`${dragging}Y` as keyof TextLayoutSettings] as number;
    
    const newXRatio = Math.max(0, Math.min(1, currentX + deltaX / canvasWidth));
    const newYRatio = Math.max(0, Math.min(1, currentY + deltaY / canvasHeight));

    const newLayout: TextLayoutSettings = {
      ...dragStartLayout.current,
      [`${dragging}X` as keyof TextLayoutSettings]: newXRatio,
      [`${dragging}Y` as keyof TextLayoutSettings]: newYRatio,
    };

    onLayoutChange(newLayout);
  }, [dragging, dragStartPos, dragStartLayout, canvasRef, getCanvasCoordinates, canvasWidth, canvasHeight, onLayoutChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    dragStartPos.current = null;
    dragStartLayout.current = null;
  }, []);

  return {
    dragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
