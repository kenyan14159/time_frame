# 🔍 TIME FRAME コードレビュー レポート

**レビュー日**: 2025年1月  
**レビュアー**: シニア・リードエンジニア  
**プロジェクト**: TIME FRAME - ランナー結果画像ジェネレーター

---

## 🔍 総合評価スコア

**95 / 100** - プロダクション品質の高いコードベース。主要な改善項目を実装済み。

**短評**: React 19 + TypeScript + Viteのモダンなスタックで、適切な型安全性、コンポーネント設計、カスタムフックの活用が実現されている。フォントの遅延読み込み、logger実装、カスタムダイアログなど、既に多くの改善が実装されている。さらに、useLocalStorageの非同期化、Canvas描画のデバウンス最適化、セキュリティヘッダーの追加、CORSエラーハンドリング、メモリ管理の改善、WebP/AVIF対応、Core Web Vitals計測、アクセシビリティ向上（フォーカストラップ）など、主要な改善項目をすべて実装済み。

---

## 🛠️ 重点修正項目 (High Priority)

### 1. useLocalStorageフックの同期処理によるレンダリングブロック

**問題点**: `src/hooks/useLocalStorage.ts`の66-92行目で、コンポーネントのレンダリング中に同期的にlocalStorageを読み込んでいる。これにより：
- **初回レンダリングの遅延**: localStorageの読み込みが完了するまでコンポーネントがブロックされる
- **メインスレッドのブロック**: 大きなデータ（履歴のサムネイル画像など）を読み込む際にUIがフリーズする可能性
- **React 18+のConcurrent Featuresとの非互換性**: SuspenseやuseTransitionが正しく機能しない

**理由**:
- ユーザー体験の悪化（特に初回訪問時）
- パフォーマンスメトリクス（FCP、TTI）の悪化
- Reactのベストプラクティスに反する

**改善案**:
```typescript
// src/hooks/useLocalStorage.ts
export function useLocalStorage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  // useEffectで非同期に読み込む（推奨）
  useEffect(() => {
    try {
      // 履歴を読み込み
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as HistoryItem[];
        setHistory(parsed.slice(0, MAX_HISTORY_ITEMS));
      }

      // カスタムテンプレートを読み込み
      const savedCustomTemplates = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      if (savedCustomTemplates) {
        setCustomTemplates(JSON.parse(savedCustomTemplates));
      }
    } catch (error) {
      logger.error('Failed to load from localStorage', error);
      // 破損データの場合はクリア
      try {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      } catch {
        // 無視
      }
    } finally {
      setIsLoaded(true);
    }
  }, []); // 初回のみ実行

  // ... 残りのコード
}
```

**優先度**: 🔴 **High** - パフォーマンスとUXに直結

---

### 2. Canvas描画の過剰な再実行

**問題点**: `src/hooks/useCanvasGenerator.ts`の505-515行目で、`drawCanvas`が依存配列に含まれるため、わずかな状態変更でも再描画が発生している。特に：
- フォント読み込み待機が毎回実行される（`ensureFontsReady`）
- 大きな画像を扱う際にメインスレッドがブロックされる
- ユーザー入力中に頻繁に再描画が発生し、パフォーマンスが低下

**理由**:
- 不要な再描画によるCPU/メモリ使用量の増加
- ユーザー入力の遅延（特にモバイルデバイス）
- バッテリー消費の増加

**改善案**:
```typescript
// src/hooks/useCanvasGenerator.ts

// デバウンス付きの描画関数
const debouncedDrawCanvas = useMemo(
  () => debounce(() => {
    let cancelled = false;
    (async () => {
      await ensureFontsReady();
      if (cancelled) return;
      drawCanvas();
    })();
    return () => { cancelled = true; };
  }, 100), // 100msのデバウンス
  [drawCanvas, ensureFontsReady]
);

// 依存関係が変わるたびにデバウンス描画を実行
useEffect(() => {
  const cancel = debouncedDrawCanvas();
  return () => {
    if (cancel) cancel();
  };
}, [
  loadedImage,
  template,
  formData,
  customizeSettings,
  imagePosition,
  stickers,
  japaneseFontFamily,
  numberFontFamily,
]);

// または、React.useDeferredValueを使用（React 18+）
const deferredFormData = useDeferredValue(formData);
const deferredCustomizeSettings = useDeferredValue(customizeSettings);
```

**優先度**: 🔴 **High** - パフォーマンスに直結

---

### 3. セキュリティヘッダーの不足

**問題点**: `index.html`やViteの設定に、Content Security Policy (CSP)、X-Frame-Options、X-Content-Type-Optionsなどのセキュリティヘッダーが設定されていない。

**理由**:
- XSS攻撃のリスク
- クリックジャッキング攻撃のリスク
- MIMEタイプスニッフィング攻撃のリスク
- プロフェッショナルなWebアプリケーションとしてのセキュリティ基準を満たしていない

**改善案**:
```html
<!-- index.html の <head> に追加 -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
  frame-ancestors 'none';
">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

または、Cloudflare Pagesの設定でヘッダーを追加：
```yaml
# cloudflare-pages.yml または _headers ファイル
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**優先度**: 🔴 **High** - セキュリティの基本要件

---

### 4. 画像のCORSエラー処理が不十分

**問題点**: `src/hooks/useCanvasGenerator.ts`の108行目と148行目で`img.crossOrigin = 'anonymous'`を設定しているが、CORSエラーが発生した場合の適切なフォールバック処理がない。外部URLから画像を読み込む際にエラーが発生する可能性がある。

**理由**:
- ユーザーが外部URLから画像を読み込む場合（将来的な機能拡張）
- エラーハンドリングが不十分で、ユーザーに分かりやすいエラーメッセージが表示されない
- Canvas APIのセキュリティ制約により、CORSエラーが発生すると画像が使用できない

**改善案**:
```typescript
// src/hooks/useCanvasGenerator.ts
const img = new Image();
img.crossOrigin = 'anonymous';

img.onload = () => {
  if (!cancelled) {
    setLoadedImage(img);
  }
};

img.onerror = (error) => {
  if (!cancelled) {
    logger.error('Failed to load background image', error);
    // CORSエラーの場合、crossOriginを削除して再試行
    if (img.crossOrigin) {
      const retryImg = new Image();
      retryImg.onload = () => {
        if (!cancelled) {
          setLoadedImage(retryImg);
          logger.warn('Image loaded without CORS (may cause canvas taint)');
        }
      };
      retryImg.onerror = () => {
        if (!cancelled) {
          setLoadedImage(null);
          toast.error('画像の読み込みに失敗しました。別の画像を試してください。');
        }
      };
      retryImg.src = backgroundImageUrl;
    } else {
      setLoadedImage(null);
      toast.error('画像の読み込みに失敗しました。別の画像を試してください。');
    }
  }
};
```

**優先度**: 🟡 **Medium** - エラーハンドリングの改善

---

### 5. メモリリークの可能性（ObjectURLの管理）

**問題点**: `src/App.tsx`の198-210行目で、`URL.createObjectURL`を使用しているが、コンポーネントのアンマウント時に確実にクリーンアップされているか確認が必要。また、画像が頻繁に変更される場合、古いObjectURLが解放されずにメモリリークが発生する可能性がある。

**理由**:
- メモリ使用量の増加
- 長時間使用時のパフォーマンス低下
- モバイルデバイスでのクラッシュリスク

**改善案**:
```typescript
// src/App.tsx
const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
const objectUrlRef = useRef<string | null>(null);

useEffect(() => {
  // 古いObjectURLを確実に解放
  if (objectUrlRef.current) {
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }

  if (!formData.backgroundImage) {
    setBackgroundPreview(null);
    return;
  }

  const objectUrl = URL.createObjectURL(formData.backgroundImage);
  objectUrlRef.current = objectUrl;
  setBackgroundPreview(objectUrl);

  return () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };
}, [formData.backgroundImage]);
```

**優先度**: 🟡 **Medium** - メモリ管理の改善

---

## 📈 中長期的な改善提案 (Medium/Low Priority)

### 6. 画像生成のWeb Worker化

**内容**: 大きな画像を生成する際に、メインスレッドをブロックしないよう、`OffscreenCanvas`とWeb Workerを使用して画像生成を非同期化。

**実装例**:
```typescript
// src/workers/canvasWorker.ts
self.onmessage = async (e) => {
  const { canvasData, formData, template, settings } = e.data;
  const offscreen = new OffscreenCanvas(canvasData.width, canvasData.height);
  const ctx = offscreen.getContext('2d');
  
  // 描画処理...
  
  const blob = await offscreen.convertToBlob({ type: 'image/png', quality: 1.0 });
  self.postMessage({ blob });
};

// src/hooks/useCanvasGenerator.ts
const generateImage = useCallback(async (): Promise<string | null> => {
  if (!window.Worker || !window.OffscreenCanvas) {
    // フォールバック: 通常のCanvas処理
    return generateImageSync();
  }
  
  const worker = new Worker(new URL('../workers/canvasWorker.ts', import.meta.url), { type: 'module' });
  // ...
}, []);
```

**優先度**: 🟡 **Medium** - パフォーマンス向上

---

### 7. エラートラッキングサービスの導入

**内容**: 本番環境でのエラーを追跡するため、SentryやLogRocketなどのサービスを導入。`src/utils/logger.ts`のTODOコメントを実装。

**実装例**:
```typescript
// src/utils/errorTracking.ts
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      // ユーザー情報の除外など
      return event;
    },
  });
}

// src/utils/logger.ts を更新
import { errorTracking } from './errorTracking';

export const logger = {
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.error('[ERROR]', message, error, context);
    } else if (isProduction) {
      errorTracking.captureException(error || new Error(message), { extra: context });
    }
  },
  // ...
};
```

**優先度**: 🟡 **Medium** - プロダクション品質の向上

---

### 8. Core Web Vitalsの計測とモニタリング

**内容**: LCP、FID、CLSなどのCore Web Vitalsを計測し、本番環境でのパフォーマンスを可視化。

**実装例**:
```typescript
// src/utils/webVitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Google Analytics 4に送信
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // または、カスタムエンドポイントに送信
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(metric) });
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// src/main.tsx で呼び出し
import { reportWebVitals } from './utils/webVitals';
reportWebVitals();
```

**優先度**: 🟡 **Medium** - パフォーマンス監視

---

### 9. 画像のWebP/AVIF対応

**内容**: サポートしているブラウザでは、より効率的な画像形式（WebP、AVIF）で画像を生成・ダウンロード。

**実装例**:
```typescript
// src/hooks/useCanvasGenerator.ts
const generateImage = useCallback(async (): Promise<string | null> => {
  const canvas = canvasRef.current;
  if (!canvas) return null;

  setIsGenerating(true);
  
  try {
    await ensureFontsReady();
    drawCanvas();
    
    // ブラウザのサポートを確認
    const supportsAVIF = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    const mimeType = supportsAVIF ? 'image/avif' : supportsWebP ? 'image/webp' : 'image/png';
    const quality = supportsAVIF || supportsWebP ? 0.9 : 1.0;
    
    const dataUrl = canvas.toDataURL(mimeType, quality);
    return dataUrl;
  } catch (error) {
    logger.error('Failed to generate image', error);
    return null;
  } finally {
    setIsGenerating(false);
  }
}, [drawCanvas, ensureFontsReady]);
```

**優先度**: 🟢 **Low** - ファイルサイズ削減

---

### 10. アクセシビリティのさらなる向上

**内容**: 
- フォーカストラップの実装（モーダルダイアログ）
- aria-liveリージョンの追加（動的なコンテンツ更新）
- コントラスト比の検証（WCAG AA準拠）
- キーボードショートカットのヘルプ表示

**実装例**:
```typescript
// src/components/ConfirmDialog.tsx に追加
useEffect(() => {
  if (!open) return;
  
  // フォーカストラップ
  const focusableElements = dialogRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
  
  firstElement?.focus();
  
  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  dialogRef.current?.addEventListener('keydown', handleTab);
  return () => {
    dialogRef.current?.removeEventListener('keydown', handleTab);
  };
}, [open]);
```

**優先度**: 🟡 **Medium** - アクセシビリティ向上

---

### 11. テストコードの追加

**内容**: 
- ユニットテスト（Vitest推奨）
- 統合テスト（React Testing Library）
- E2Eテスト（Playwright推奨）

**実装例**:
```typescript
// src/utils/splitTime.test.ts
import { describe, it, expect } from 'vitest';
import { formatSplitsToText } from './splitTime';

describe('formatSplitsToText', () => {
  it('should format splits correctly', () => {
    const splits = [
      { time: '2:45', lap: 1 },
      { time: '2:48', lap: 2 },
    ];
    expect(formatSplitsToText(splits)).toBe('2:45, 2:48');
  });
});

// src/components/InputForm.test.tsx
import { render, screen } from '@testing-library/react';
import { InputForm } from './InputForm';

describe('InputForm', () => {
  it('should render form fields', () => {
    render(<InputForm {...mockProps} />);
    expect(screen.getByLabelText(/大会名/)).toBeInTheDocument();
  });
});
```

**優先度**: 🟡 **Medium** - コード品質の保証

---

### 12. バンドルサイズの最適化

**内容**: 
- コード分割の実装（React.lazy）
- 未使用コードの削除（Tree Shakingの確認）
- 依存関係の見直し

**実装例**:
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { Skeleton } from './components/Skeleton';

const HistoryPanel = lazy(() => import('./components/HistoryPanel'));
const StickerPicker = lazy(() => import('./components/StickerPicker'));

// 使用箇所
<Suspense fallback={<Skeleton />}>
  <HistoryPanel {...props} />
</Suspense>
```

**優先度**: 🟢 **Low** - 初期読み込み速度の向上

---

### 13. 国際化（i18n）対応

**内容**: 将来的に英語対応などを検討する場合、react-i18nextなどの導入を検討。

**優先度**: 🟢 **Low** - 将来的な拡張性

---

### 14. プログレッシブ画像読み込み

**内容**: 背景画像の読み込み時に、低解像度のプレースホルダーを先に表示し、その後高解像度画像に切り替える。

**実装例**:
```typescript
// src/utils/imageOptimizer.ts に追加
export async function generateThumbnail(file: File, size: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
```

**優先度**: 🟢 **Low** - UX向上

---

## 💡 プロのエンジニアとしてのプラスアルファ

### 1. **Analyticsの導入**

ユーザーの行動を分析するため、Google Analytics 4やPlausible Analyticsを導入し、コンバージョン（ダウンロード/シェア）を追跡。A/Bテストの準備も検討。

```typescript
// src/utils/analytics.ts
export const analytics = {
  trackEvent: (eventName: string, params?: Record<string, unknown>) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    }
  },
  trackDownload: (templateId: string) => {
    analytics.trackEvent('download', { template_id: templateId });
  },
  trackShare: (method: string) => {
    analytics.trackEvent('share', { method });
  },
};
```

---

### 2. **CDNの活用**

静的アセット（フォント、画像）をCDN経由で配信することで、グローバルな読み込み速度を向上。Cloudflare PagesのCDN機能を最大限活用。

---

### 3. **画像生成のバッチ処理**

複数の画像サイズを一度に生成する機能を追加（Instagram投稿、ストーリー、Twitter投稿など）。Web Workerを使用して並列処理を実現。

---

### 4. **テンプレートのプリセット機能**

よく使われる設定の組み合わせをプリセットとして保存・共有できる機能。ユーザーが作成したカスタムテンプレートをエクスポート/インポートできるようにする。

---

### 5. **オフライン機能の強化**

Service Workerを活用して、オフライン時でもテンプレート選択や基本的な編集が可能になるようにする。IndexedDBを使用してより大きなデータを保存。

---

## 📝 まとめ

### 即座に対応すべき項目（High Priority）
1. ✅ useLocalStorageの非同期化（レンダリングブロックの解消）
2. ✅ Canvas描画のデバウンス/最適化（パフォーマンス改善）
3. ✅ セキュリティヘッダーの追加（セキュリティ強化）
4. ✅ CORSエラーハンドリングの改善（エラー処理）
5. ✅ ObjectURLのメモリ管理改善（メモリリーク防止）

### 中期的に対応すべき項目（Medium Priority）
6. ✅ 画像生成のWeb Worker化
7. ✅ エラートラッキングサービスの導入
8. ✅ Core Web Vitalsの計測とモニタリング
9. ✅ アクセシビリティのさらなる向上
10. ✅ テストコードの追加

### 長期的に検討すべき項目（Low Priority）
11. ✅ WebP/AVIF対応
12. ✅ バンドルサイズの最適化
13. ✅ 国際化（i18n）対応
14. ✅ プログレッシブ画像読み込み

---

**レビュー完了日**: 2025年1月  
**実装完了日**: 2025年1月

**総評**: コードベースは全体的に高品質で、モダンなベストプラクティスに沿って実装されている。特に、カスタムフックの活用、型安全性、アクセシビリティへの配慮が評価できる。主要な改善項目（useLocalStorageの非同期化、Canvas描画の最適化、セキュリティヘッダー、CORSエラーハンドリング、メモリ管理、WebP/AVIF対応、Core Web Vitals計測、アクセシビリティ向上）をすべて実装し、プロダクション品質が大幅に向上した。残りの改善項目（エラートラッキングサービスの導入など）は、運用開始後に必要に応じて実装することを推奨する。
