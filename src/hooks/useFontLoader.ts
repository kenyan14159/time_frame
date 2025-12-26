import { useEffect, useState } from 'react';
import { logger } from '../utils/logger';

/**
 * フォントを動的に読み込むフック
 * 選択されたフォントのみを読み込むことで、初期読み込み時間を短縮
 */
export function useFontLoader(fontFamily: string, weights: number[] = [400, 700]) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // フォント名をURLエンコード（スペースを+に変換してからエンコード）
    // 例: "Bebas Neue" -> "Bebas+Neue"
    const fontNameForUrl = fontFamily.replace(/\s+/g, '+');
    const weightsParam = weights.join(';');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontNameForUrl}:wght@${weightsParam}&display=swap`;

    // 既に読み込まれているかチェック（フォント名で検索）
    const fontNameForCheck = fontFamily.replace(/\s+/g, '+');
    const existingLink = document.querySelector(`link[href*="${fontNameForCheck}"]`);
    if (existingLink) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);

    // フォントを動的に読み込む
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
      setIsLoaded(true);
      setIsLoading(false);
      logger.log(`Font loaded: ${fontFamily}`);
    };
    link.onerror = () => {
      logger.error(`Failed to load font: ${fontFamily}`);
      setIsLoading(false);
    };

    document.head.appendChild(link);

    return () => {
      // クリーンアップ（オプション: 他のコンポーネントで使用中の可能性があるため削除しない）
      // link.remove();
    };
  }, [fontFamily, weights.join(',')]);

  return { isLoaded, isLoading };
}

/**
 * 複数のフォントを事前に読み込む関数
 * よく使われるフォントを事前読み込みする場合に使用
 */
export function preloadFonts(fonts: Array<{ family: string; weights?: number[] }>) {
  fonts.forEach(({ family, weights = [400, 700] }) => {
    const fontNameForUrl = family.replace(/\s+/g, '+');
    const weightsParam = weights.join(';');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontNameForUrl}:wght@${weightsParam}&display=swap`;

    // 既に読み込まれているかチェック
    const existingLink = document.querySelector(`link[href*="${fontNameForUrl}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  });
}

