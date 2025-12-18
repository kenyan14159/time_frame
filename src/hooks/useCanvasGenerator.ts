import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import type { FormData, Template, CustomizeSettings, FontConfig, ImagePosition, Sticker } from '../types';
import { getOutputSize, getNumberFontFamily, getJapaneseFontFamily, DEFAULT_IMAGE_POSITION } from '../types';
import { toRomaji } from '../utils/romaji';

interface UseCanvasGeneratorProps {
  formData: FormData;
  template: Template;
  backgroundImageUrl: string | null;
  customizeSettings: CustomizeSettings;
  imagePosition?: ImagePosition;
  stickers?: Sticker[];
}

interface UseCanvasGeneratorReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isGenerating: boolean;
  isReady: boolean;
  hasBackgroundImage: boolean;
  generateImage: () => Promise<string | null>;
  downloadImage: () => Promise<void>;
  shareImage: () => Promise<boolean>;
}

export function useCanvasGenerator({
  formData,
  template,
  backgroundImageUrl,
  customizeSettings,
  imagePosition = DEFAULT_IMAGE_POSITION,
  stickers = [],
}: UseCanvasGeneratorProps): UseCanvasGeneratorReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [loadedStickers, setLoadedStickers] = useState<Map<string, HTMLImageElement>>(new Map());

  const outputSize = useMemo(() => getOutputSize(customizeSettings.outputSizeId), [customizeSettings.outputSizeId]);
  const { width, height } = outputSize;
  
  // フォントファミリーをメモ化
  const numberFontFamily = useMemo(() => getNumberFontFamily(customizeSettings.numberFontId), [customizeSettings.numberFontId]);
  const japaneseFontFamily = useMemo(() => getJapaneseFontFamily(customizeSettings.japaneseFontId), [customizeSettings.japaneseFontId]);

  // フォント読み込み完了を待つ（Canvas描画の崩れ防止）
  const ensureFontsReady = useCallback(async () => {
    // Safari等でdocument.fontsが無い環境はスキップ
    if (typeof document === 'undefined' || !('fonts' in document)) return;

    const japaneseWeights = new Set<number>([
      template.fonts.eventName.weight,
      template.fonts.eventType.weight,
      template.fonts.comment.weight,
    ]);
    const numberWeights = new Set<number>([template.fonts.record.weight]);

    const loaders: Promise<FontFace[]>[] = [];
    for (const w of japaneseWeights) {
      loaders.push(document.fonts.load(`${w} 32px ${japaneseFontFamily}`));
    }
    for (const w of numberWeights) {
      loaders.push(document.fonts.load(`${w} 32px ${numberFontFamily}`));
    }

    await Promise.all(loaders.map(p => p.catch(() => [])));
    await document.fonts.ready;
  }, [japaneseFontFamily, numberFontFamily, template]);

  // 背景画像をロード（メモ化とエラーハンドリング改善）
  useEffect(() => {
    if (!backgroundImageUrl) {
      setLoadedImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    let cancelled = false;
    
    img.onload = () => {
      if (!cancelled) {
        setLoadedImage(img);
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        console.error('Failed to load image');
        setLoadedImage(null);
      }
    };
    img.src = backgroundImageUrl;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [backgroundImageUrl]);

  // ロゴステッカー画像をロード
  useEffect(() => {
    const logoStickers = stickers.filter(s => s.type === 'logo');
    const newLoadedStickers = new Map<string, HTMLImageElement>();
    
    let cancelled = false;
    
    const loadPromises = logoStickers.map(sticker => {
      return new Promise<void>((resolve) => {
        if (loadedStickers.has(sticker.id)) {
          newLoadedStickers.set(sticker.id, loadedStickers.get(sticker.id)!);
          resolve();
          return;
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!cancelled) {
            newLoadedStickers.set(sticker.id, img);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = sticker.content;
      });
    });
    
    Promise.all(loadPromises).then(() => {
      if (!cancelled) {
        setLoadedStickers(newLoadedStickers);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [stickers]);

  // テキストを描画するヘルパー関数
  const drawText = useCallback((
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontConfig: FontConfig,
    fontFamily: string,
    customColor: string,
    canvasWidth: number,
    _canvasHeight: number,
    options?: {
      rotation?: number;
      outline?: boolean;
      shadow?: boolean;
      accentColor?: string;
    }
  ) => {
    if (!text) return;

    // サイズを出力サイズに応じてスケーリング
    const scaleFactor = canvasWidth / 1080;
    const scaledSize = Math.round(fontConfig.size * scaleFactor);
    
    ctx.save();

    // 回転がある場合
    if (options?.rotation) {
      const centerX = x;
      const centerY = y;
      ctx.translate(centerX, centerY);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // フォント設定
    ctx.font = `${fontConfig.weight} ${scaledSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // letter-spacing対応（Canvasでは手動で実装）
    const letterSpacing = (fontConfig.letterSpacing || 0) * scaledSize;

    // テキストが長すぎる場合はフォントサイズを縮小
    let fontSize = scaledSize;
    const maxWidth = canvasWidth * 0.88;
    ctx.font = `${fontConfig.weight} ${fontSize}px ${fontFamily}`;
    
    while (ctx.measureText(text).width + letterSpacing * text.length > maxWidth && fontSize > 16) {
      fontSize -= 2;
      ctx.font = `${fontConfig.weight} ${fontSize}px ${fontFamily}`;
    }

    // シャドウ（アウトラインの前に設定）
    if (options?.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 15 * scaleFactor;
      ctx.shadowOffsetX = 3 * scaleFactor;
      ctx.shadowOffsetY = 3 * scaleFactor;
    }

    // アウトライン（縁取り）
    if (options?.outline) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 4 * scaleFactor;
      ctx.lineJoin = 'round';
      
      if (letterSpacing !== 0) {
        drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing, true);
      } else {
        ctx.strokeText(text, x, y);
      }
    }

    // テキスト本体
    ctx.fillStyle = customColor;
    
    if (letterSpacing !== 0) {
      drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing, false);
    } else {
      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }, []);

  // letter-spacing付きでテキストを描画
  const drawTextWithLetterSpacing = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    letterSpacing: number,
    isStroke: boolean
  ) => {
    const chars = text.split('');
    const totalWidth = ctx.measureText(text).width + letterSpacing * (chars.length - 1);
    let currentX = x - totalWidth / 2;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const charWidth = ctx.measureText(char).width;
      
      if (isStroke) {
        ctx.strokeText(char, currentX + charWidth / 2, y);
      } else {
        ctx.fillText(char, currentX + charWidth / 2, y);
      }
      
      currentX += charWidth + letterSpacing;
    }
  };

  // ステッカーを描画
  const drawStickers = useCallback((ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const scaleFactor = canvasWidth / 1080;
    
    stickers.forEach(sticker => {
      const x = sticker.x * canvasWidth;
      const y = sticker.y * canvasHeight;
      const size = sticker.size * scaleFactor;
      
      ctx.save();
      
      // 位置と回転
      ctx.translate(x, y);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      
      if (sticker.type === 'emoji') {
        // 絵文字を描画
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.content, 0, 0);
      } else if (sticker.type === 'logo') {
        // ロゴ画像を描画
        const img = loadedStickers.get(sticker.id);
        if (img) {
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
        }
      }
      
      ctx.restore();
    });
  }, [stickers, loadedStickers]);

  // Canvasを描画
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvasサイズを設定
    canvas.width = width;
    canvas.height = height;

    // 背景をクリア
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 背景画像を描画（カバー + 位置調整）
    if (loadedImage) {
      const imgRatio = loadedImage.width / loadedImage.height;
      const canvasRatio = width / height;

      // スケールを適用
      const scale = imagePosition.scale;

      let drawWidth: number;
      let drawHeight: number;

      if (imgRatio > canvasRatio) {
        drawHeight = height * scale;
        drawWidth = height * imgRatio * scale;
      } else {
        drawWidth = width * scale;
        drawHeight = width / imgRatio * scale;
      }

      // 位置調整（-1から1の範囲で、0が中央）
      const maxOffsetX = (drawWidth - width) / 2;
      const maxOffsetY = (drawHeight - height) / 2;
      
      const offsetX = (width - drawWidth) / 2 + imagePosition.x * maxOffsetX;
      const offsetY = (height - drawHeight) / 2 + imagePosition.y * maxOffsetY;

      // 画像フィルターを適用
      const filters = [];
      if (customizeSettings.grayscale > 0) filters.push(`grayscale(${customizeSettings.grayscale}%)`);
      if (customizeSettings.brightness !== 100) filters.push(`brightness(${customizeSettings.brightness}%)`);
      if (customizeSettings.contrast !== 100) filters.push(`contrast(${customizeSettings.contrast}%)`);
      if (customizeSettings.blur > 0) filters.push(`blur(${customizeSettings.blur}px)`);
      
      if (filters.length > 0) {
        ctx.filter = filters.join(' ');
      }
      
      ctx.drawImage(loadedImage, offsetX, offsetY, drawWidth, drawHeight);
      
      // フィルターをリセット
      ctx.filter = 'none';
    }

    // オーバーレイを描画
    if (template.overlayGradient) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = template.overlay;
    }
    ctx.fillRect(0, 0, width, height);

    // カスタムフォントファミリーとカラー（既にメモ化済み）
    const customColor = customizeSettings.textColor;

    // テキストを描画（順番: 大会名 → 種目 → 記録 → 一言）
    const { layout, fonts, style } = template;
    
    // カスタムレイアウト設定を取得（デフォルトはテンプレートの値）
    const customLayout = customizeSettings.textLayout;
    const eventNameX = (customLayout?.eventNameX ?? layout.eventNameX ?? 0.5) * width;
    const eventNameY = (customLayout?.eventNameY ?? layout.eventNameY) * height;
    const eventTypeX = (customLayout?.eventTypeX ?? layout.eventTypeX ?? 0.5) * width;
    const eventTypeY = (customLayout?.eventTypeY ?? layout.eventTypeY) * height;
    const recordX = (customLayout?.recordX ?? layout.recordX ?? 0.5) * width;
    const recordY = (customLayout?.recordY ?? layout.recordY) * height;
    const commentX = (customLayout?.commentX ?? layout.commentX ?? 0.5) * width;
    const commentY = (customLayout?.commentY ?? layout.commentY) * height;
    
    const eventNameSize = customLayout?.eventNameSize ?? 100;
    const eventTypeSize = customLayout?.eventTypeSize ?? 100;
    const recordSize = customLayout?.recordSize ?? 100;
    const commentSize = customLayout?.commentSize ?? 100;

    // 各テキストの色（カスタム設定があればそれを使用、なければデフォルト）
    const eventNameColor = customLayout?.eventNameColor ?? customColor;
    const eventTypeColor = customLayout?.eventTypeColor ?? (template.style.accentColor && template.id === 'magazine' ? template.style.accentColor : customColor);
    const recordColor = customLayout?.recordColor ?? customColor;
    const commentColor = customLayout?.commentColor ?? (customColor + 'dd');

    // 各テキストの回転角度（カスタム設定があればそれを使用、なければテンプレートの値）
    const eventNameRotation = customLayout?.eventNameRotation ?? 0;
    const eventTypeRotation = customLayout?.eventTypeRotation ?? 0;
    const recordRotation = customLayout?.recordRotation ?? layout.recordRotation ?? 0;
    const commentRotation = customLayout?.commentRotation ?? 0;

    // 大会名（日本語フォント使用）
    if (formData.eventName) {
      drawText(
        ctx,
        formData.eventName,
        eventNameX,
        eventNameY,
        { ...fonts.eventName, size: fonts.eventName.size * (eventNameSize / 100) },
        japaneseFontFamily,
        eventNameColor,
        width,
        height,
        { 
          shadow: true,
          rotation: eventNameRotation,
        }
      );
    }

    // 種目（日本語フォント使用）
    if (formData.eventType) {
      drawText(
        ctx,
        formData.eventType,
        eventTypeX,
        eventTypeY,
        { ...fonts.eventType, size: fonts.eventType.size * (eventTypeSize / 100) },
        japaneseFontFamily,
        eventTypeColor,
        width,
        height,
        { 
          shadow: true,
          rotation: eventTypeRotation,
        }
      );
    }

    // 記録（数字フォント使用、回転・縁取り・シャドウオプション）
    if (formData.record) {
      drawText(
        ctx,
        formData.record,
        recordX,
        recordY,
        { ...fonts.record, size: fonts.record.size * (recordSize / 100) },
        numberFontFamily,
        recordColor,
        width,
        height,
        {
          rotation: recordRotation,
          outline: style.recordOutline,
          shadow: style.recordShadow,
        }
      );
    }

    // コメント（日本語フォント使用）
    if (formData.comment) {
      drawText(
        ctx,
        formData.comment,
        commentX,
        commentY,
        { ...fonts.comment, size: fonts.comment.size * (commentSize / 100) },
        japaneseFontFamily,
        commentColor,
        width,
        height,
        { 
          shadow: true,
          rotation: commentRotation,
        }
      );
    }

    // ステッカーを描画
    if (stickers.length > 0) {
      drawStickers(ctx, width, height);
    }
  }, [loadedImage, template, formData, width, height, drawText, customizeSettings, imagePosition, stickers, drawStickers, japaneseFontFamily, numberFontFamily]);

  // 依存関係が変わるたびに再描画
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureFontsReady();
      if (cancelled) return;
      drawCanvas();
    })();
    return () => {
      cancelled = true;
    };
  }, [drawCanvas, ensureFontsReady]);

  // PNG画像を生成
  const generateImage = useCallback(async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      return null;
    }

    setIsGenerating(true);
    
    try {
      await ensureFontsReady();
      drawCanvas();
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Failed to generate image data URL');
      }
      return dataUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [drawCanvas, ensureFontsReady]);

  // 画像をダウンロード
  const downloadImage = useCallback(async (): Promise<void> => {
    const dataUrl = await generateImage();
    if (!dataUrl) {
      throw new Error('Failed to generate image');
    }

    const sanitizeFileName = (name: string): string => {
      const romaji = toRomaji(name);
      return romaji.slice(0, 50); // ローマ字に変換して長さ制限
    };

    try {
      const link = document.createElement('a');
      const fileName = formData.eventName 
        ? sanitizeFileName(formData.eventName)
        : 'image';
      link.download = `result_${fileName}_${Date.now()}.png`;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download image:', error);
      throw error;
    }
  }, [generateImage, formData.eventName]);

  // 画像をシェア（キャンセル時はfalseを返す）
  const shareImage = useCallback(async (): Promise<boolean> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    // Web Share APIが利用不可の場合はダウンロードにフォールバック
    if (!navigator.share) {
      await downloadImage();
      return true;
    }

    setIsGenerating(true);
    
    try {
      await ensureFontsReady();
      drawCanvas();
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
      
      if (!blob) {
        setIsGenerating(false);
        // Blobの生成に失敗した場合はダウンロードにフォールバック
        await downloadImage();
        return true;
      }

      const file = new File([blob], 'result.png', { type: 'image/png' });
      
      // ファイルシェアがサポートされているか確認
      const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });
      
      if (canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            title: 'TIME FRAME',
            text: `${formData.eventName} - ${formData.eventType}: ${formData.record}`,
          });
          setIsGenerating(false);
          return true;
        } catch (shareError) {
          setIsGenerating(false);
          // ユーザーがシェアをキャンセルした場合
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            return false;
          }
          // その他のエラーはダウンロードにフォールバック
          console.warn('Share failed, falling back to download:', shareError);
          await downloadImage();
          return true;
        }
      } else {
        setIsGenerating(false);
        // ファイルシェア非対応の場合はダウンロードにフォールバック
        await downloadImage();
        return true;
      }
    } catch (error) {
      setIsGenerating(false);
      // AbortErrorの場合はキャンセル扱い
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      console.error('Failed to share image:', error);
      // エラー時もダウンロードにフォールバック
      try {
        await downloadImage();
        return true;
      } catch {
        throw error;
      }
    }
  }, [drawCanvas, formData, downloadImage, ensureFontsReady]);

  // 背景画像が選択された時点でプレビューを表示
  const hasBackgroundImage = !!loadedImage;
  
  // ダウンロード可能かチェック（記録と背景画像のみ必須）
  const isReady = !!(
    formData.record.trim() &&
    loadedImage
  );

  return {
    canvasRef,
    isGenerating,
    isReady,
    hasBackgroundImage,
    generateImage,
    downloadImage,
    shareImage,
  };
}
