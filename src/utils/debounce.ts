import { useMemo } from 'react';

/**
 * デバウンス関数
 * 連続して呼び出される関数を、指定した時間だけ遅延させて実行
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * React用のデバウンスフック（useMemoと組み合わせて使用）
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => debounce(func, wait), [func, wait]) as T;
}

