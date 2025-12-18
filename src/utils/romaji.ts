// 日本語をローマ字に変換する簡易関数
export function toRomaji(text: string): string {
  if (!text || !text.trim()) {
    return 'image';
  }

  // よく使われる単語の変換マップ（長い順に並べる）
  const wordMap: Array<[string, string]> = [
    ['箱根駅伝', 'hakone-ekiden'],
    ['駅伝', 'ekiden'],
    ['記録会', 'kirokukai'],
    ['インターバル', 'interval'],
    ['ハーフマラソン', 'half-marathon'],
    ['マラソン', 'marathon'],
    ['練習', 'renshu'],
    ['大会', 'taikai'],
    ['日体大', 'nittaidai'],
    ['走', 'sou'],
  ];

  let result = text.trim();
  
  // よく使われる単語を先に変換（長い順）
  for (const [key, value] of wordMap) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  
  // 日本語文字（ひらがな・カタカナ・漢字）を削除
  // 英数字とハイフン・アンダースコアのみを残す
  result = result
    .replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '') // ひらがな・カタカナ・漢字を削除
    .toLowerCase()
    .replace(/\s+/g, '-') // スペースをハイフンに
    .replace(/[^a-z0-9-]/g, '') // 英数字とハイフン以外を削除
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-|-$/g, ''); // 先頭・末尾のハイフンを削除
  
  return result || 'image';
}
