/**
 * Core Web Vitalsの計測とレポート
 * LCP、FID、CLSなどのパフォーマンスメトリクスを計測
 */

type WebVitalMetric = {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
};

type MetricHandler = (metric: WebVitalMetric) => void;

/**
 * Web Vitalsを計測してレポートする関数
 */
export function reportWebVitals(onPerfEntry?: MetricHandler) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // web-vitalsライブラリがインストールされている場合に使用
    // インストールされていない場合は、基本的なPerformance APIを使用
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
          };
          if (lastEntry && onPerfEntry) {
            const value = (lastEntry.renderTime || lastEntry.loadTime || 0) / 1000;
            onPerfEntry({
              name: 'LCP',
              value,
              id: lastEntry.name,
              delta: value,
              entries: [lastEntry],
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // ブラウザがサポートしていない場合は無視
      }

      // FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (onPerfEntry && 'processingStart' in entry && 'startTime' in entry) {
              const value = (entry as any).processingStart - entry.startTime;
              onPerfEntry({
                name: 'FID',
                value: value / 1000,
                id: entry.name || 'fid',
                delta: value / 1000,
                entries: [entry],
              });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // ブラウザがサポートしていない場合は無視
      }

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (
              entry instanceof PerformanceEntry &&
              'value' in entry &&
              !(entry as any).hadRecentInput
            ) {
              clsValue += (entry as any).value;
            }
          });
          if (onPerfEntry && clsValue > 0) {
            onPerfEntry({
              name: 'CLS',
              value: clsValue,
              id: 'cls',
              delta: clsValue,
              entries: [],
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // ブラウザがサポートしていない場合は無視
      }
    }
  }
}

/**
 * Google Analytics 4に送信する関数
 */
export function sendToAnalytics(metric: WebVitalMetric) {
  // Google Analytics 4が設定されている場合に送信
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // 開発環境ではコンソールに出力
  if (import.meta.env.DEV) {
    console.log('[Web Vitals]', metric.name, metric.value);
  }
}

