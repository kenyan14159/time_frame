interface DownloadButtonProps {
  onDownload: () => void;
  onShare: () => void;
  isReady: boolean;
  isGenerating: boolean;
}

export function DownloadButton({ onDownload, onShare, isReady, isGenerating }: DownloadButtonProps) {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onDownload}
        disabled={!isReady || isGenerating}
        aria-label={isReady ? '画像をダウンロード' : '必須項目を入力してください'}
        aria-disabled={!isReady || isGenerating}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg
          transition-all duration-200 transform
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
          ${isReady && !isGenerating
            ? 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-surface text-text-muted cursor-not-allowed border border-border'
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            生成中...
          </span>
        ) : isReady ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            画像をダウンロード
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            必須項目を入力してください
          </span>
        )}
      </button>

      {isReady && canShare && (
        <button
          onClick={onShare}
          disabled={isGenerating}
          aria-label="SNSでシェアする"
          aria-disabled={isGenerating}
          className="w-full py-3 px-6 rounded-xl font-semibold text-text-primary bg-surface border border-border hover:bg-surface-hover transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          SNSでシェアする
        </button>
      )}
    </div>
  );
}
