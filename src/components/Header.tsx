import { useState, useCallback } from 'react';

export function Header() {
  const [copied, setCopied] = useState(false);

  // サイトをシェア
  const handleShareSite = useCallback(async () => {
    const shareData = {
      title: 'TIME FRAME - ランナー専用リザルト画像メーカー',
      text: '駅伝・長距離ランナー専用のリザルト・練習記録画像メーカー。無料・登録不要で使えます！',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // フォールバック: URLをクリップボードにコピー
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // ユーザーがキャンセルした場合は無視
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      // クリップボードへのフォールバック
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to copy URL');
      }
    }
  }, []);

  return (
    <header className="text-center py-10 md:py-16 px-4 animate-fade-in">
      {/* ロゴ */}
      <div className="mb-6">
        <span className="text-sm md:text-base font-medium text-text-muted tracking-widest">
          <span className="text-accent">TIME</span> FRAME
        </span>
      </div>

      {/* メインコピー */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight leading-tight">
        その記録、<br className="sm:hidden" />もっとカッコよく残せる。
      </h1>
      
      {/* サブコピー */}
      <p className="text-text-secondary text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-2">
        <span className="text-text-primary font-medium">走った結果を、誇れる一枚に。</span>
      </p>
      <p className="text-text-muted text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
        大会名とタイムを入れるだけで、SNS用リザルト画像を作成できます。
      </p>
      
      {/* バッジ＆シェアボタン */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full border border-border text-xs text-text-muted">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          無料・登録不要
        </div>
        
        <button
          onClick={handleShareSite}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-hover rounded-full border border-border text-xs text-text-muted hover:text-text-secondary transition-colors"
          title="このサイトをシェア"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-500">コピーしました</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>シェア</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
