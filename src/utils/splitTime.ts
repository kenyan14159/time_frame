// スプリットタイムの型
export interface SplitTime {
  id: string;
  lap: number;
  time: string;
}

// スプリットタイムを記録テキストに変換
export function formatSplitsToText(splits: SplitTime[]): string {
  if (splits.length === 0) return '';
  
  const times = splits
    .filter(s => s.time.trim())
    .map(s => s.time.trim());
  
  if (times.length === 0) return '';
  
  return times.join(', ');
}

// テキストからスプリットタイムを解析
export function parseSplitsFromText(text: string): SplitTime[] {
  const parts = text.split(/[,、\s]+/).filter(Boolean);
  return parts.map((time, index) => ({
    id: `split-${Date.now()}-${index}`,
    lap: index + 1,
    time: time.trim(),
  }));
}

