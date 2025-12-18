export function Header() {
  return (
    <header className="text-center py-8 md:py-12 px-4 animate-fade-in">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 tracking-tight">
        <span className="text-accent">TIME</span> FRAME
      </h1>
      
      <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto leading-relaxed">
        駅伝・長距離ランナー専用
        <br className="md:hidden" />
        <span className="hidden md:inline"> — </span>
        <span className="text-text-primary font-medium">リザルト・練習記録を誇れる</span>画像メーカー
      </p>
      
      {/* バッジ */}
      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full border border-border text-xs text-text-muted">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        無料・登録不要
      </div>
    </header>
  );
}
