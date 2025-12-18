import type { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

// 基本的なスケルトンコンポーネント
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-surface-hover rounded ${className}`}
    />
  );
}

// テキスト用スケルトン
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

// プレビュー用スケルトン
export function SkeletonPreview({ aspectRatio = 1 }: { aspectRatio?: number }) {
  return (
    <div 
      className="w-full bg-surface rounded-xl overflow-hidden border border-border"
      style={{ aspectRatio }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="w-24 h-24 rounded-lg" />
        <SkeletonText lines={2} className="w-full max-w-[200px]" />
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>
    </div>
  );
}

// フォーム用スケルトン
export function SkeletonForm() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

// カード用スケルトン
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface rounded-lg border border-border p-4 ${className}`}>
      <Skeleton className="h-16 w-full rounded-md mb-3" />
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

// ローディングオーバーレイ
export function LoadingOverlay({ message = '処理中...' }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        {/* スピナー */}
        <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </div>
  );
}

// プログレスバー
export function ProgressBar({ progress, className = '' }: { progress: number; className?: string }) {
  return (
    <div className={`w-full h-2 bg-surface-hover rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
