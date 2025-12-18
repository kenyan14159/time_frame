import type { Template } from '../types';

// テンプレート①：ドヤ全振り（広告風）
// Nike広告／スポーツイベント系
// Bebas Neue + Noto Sans JP の最強構成
export const dovaTemplate: Template = {
  id: 'dova',
  name: 'ドヤ全振り',
  description: '広告風・スポーツイベント系',
  overlay: 'rgba(0, 0, 0, 0.50)',
  overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)',
  fonts: {
    eventName: {
      size: 58,
      weight: 800,
      color: '#ffffff',
      letterSpacing: -0.01,
    },
    eventType: {
      size: 46,
      weight: 700,
      color: '#ffdd00',
      letterSpacing: 0.02,
    },
    record: {
      size: 180,
      weight: 400,
      color: '#ffffff',
      letterSpacing: 0.1,
    },
    comment: {
      size: 38,
      weight: 600,
      color: '#ffdd00',
      letterSpacing: 0.02,
    },
  },
  layout: {
    eventNameX: 0.48,  // やや左寄り
    eventNameY: 0.20,
    eventTypeX: 0.52,  // やや右寄り
    eventTypeY: 0.32,
    recordX: 0.5,      // 中央
    recordY: 0.52,
    commentX: 0.5,     // 中央
    commentY: 0.76,
    recordRotation: -8,  // 右上がり8度
  },
  style: {
    recordOutline: true,
    recordShadow: true,
    accentColor: '#ffdd00',
  },
};

// テンプレート②：シンプル美（記録証リデザイン）
// Montserrat + Noto Sans JP
// 余白多め、全て水平、玄人好み
export const simpleTemplate: Template = {
  id: 'simple',
  name: 'シンプル美',
  description: '記録証リデザイン・余白多め',
  overlay: 'rgba(0, 0, 0, 0.40)',
  overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)',
  fonts: {
    eventName: {
      size: 50,
      weight: 700,
      color: '#ffffff',
      letterSpacing: 0.03,
    },
    eventType: {
      size: 38,
      weight: 500,
      color: '#a8a8a8',
      letterSpacing: 0.08,
    },
    record: {
      size: 150,
      weight: 800,
      color: '#ffffff',
      letterSpacing: 0.03,
    },
    comment: {
      size: 34,
      weight: 400,
      color: '#b8b8b8',
      letterSpacing: 0.05,
    },
  },
  layout: {
    eventNameX: 0.5,
    eventNameY: 0.24,
    eventTypeX: 0.5,
    eventTypeY: 0.35,
    recordX: 0.5,
    recordY: 0.54,
    commentX: 0.5,
    commentY: 0.78,
    recordRotation: 0,  // 水平
  },
  style: {
    recordOutline: false,
    recordShadow: true,
    accentColor: '#60a5fa',
  },
};

// テンプレート③：雑誌風
// Oswald + Noto Sans JP
// 見出しっぽく、雑誌表紙風
export const magazineTemplate: Template = {
  id: 'magazine',
  name: '雑誌風',
  description: '雑誌表紙・見出しスタイル',
  overlay: 'rgba(0, 0, 0, 0.48)',
  overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)',
  fonts: {
    eventName: {
      size: 54,
      weight: 800,
      color: '#ffffff',
      letterSpacing: 0.05,
    },
    eventType: {
      size: 42,
      weight: 600,
      color: '#fbbf24',  // 黄色アクセント
      letterSpacing: 0.12,
    },
    record: {
      size: 165,
      weight: 600,
      color: '#ffffff',
      letterSpacing: 0.08,
    },
    comment: {
      size: 36,
      weight: 500,
      color: '#fbbf24',
      letterSpacing: 0.03,
    },
  },
  layout: {
    eventNameX: 0.45,  // 左寄り
    eventNameY: 0.18,
    eventTypeX: 0.55,  // 右寄り
    eventTypeY: 0.30,
    recordX: 0.5,      // 中央
    recordY: 0.50,
    commentX: 0.5,     // 中央
    commentY: 0.74,
    recordRotation: -10,  // 右上がり10度
  },
  style: {
    recordOutline: true,
    recordShadow: true,
    accentColor: '#fbbf24',
  },
};

// テンプレート④：駅伝スタイル
// Anton + Noto Sans JP
// 太め・ドヤ感強め・短距離/駅伝区間向け
export const ekidenTemplate: Template = {
  id: 'ekiden',
  name: '駅伝スタイル',
  description: '太字・迫力重視',
  overlay: 'rgba(0, 0, 0, 0.52)',
  overlayGradient: 'linear-gradient(180deg, rgba(220,38,38,0.1) 0%, rgba(0,0,0,0.7) 100%)',
  fonts: {
    eventName: {
      size: 60,
      weight: 900,
      color: '#ffffff',
      letterSpacing: 0,
    },
    eventType: {
      size: 48,
      weight: 800,
      color: '#fecaca',
      letterSpacing: 0.02,
    },
    record: {
      size: 190,
      weight: 400,
      color: '#ffffff',
      letterSpacing: 0.08,
    },
    comment: {
      size: 40,
      weight: 600,
      color: '#fecaca',
      letterSpacing: 0.02,
    },
  },
  layout: {
    eventNameX: 0.47,  // 左寄り
    eventNameY: 0.20,
    eventTypeX: 0.53,  // 右寄り
    eventTypeY: 0.33,
    recordX: 0.5,      // 中央
    recordY: 0.53,
    commentX: 0.5,     // 中央
    commentY: 0.76,
    recordRotation: -12,  // 右上がり12度
  },
  style: {
    recordOutline: true,
    recordShadow: true,
    accentColor: '#ef4444',
  },
};

// テンプレート⑤：サイバー・ネオン
// 記録をネオン管のように光らせる
export const cyberTemplate: Template = {
  id: 'cyber',
  name: 'ネオン',
  description: '近未来・サイバースタイル',
  overlay: 'rgba(0, 0, 0, 0.70)',
  overlayGradient: 'linear-gradient(180deg, rgba(0,242,255,0.1) 0%, rgba(0,0,0,0.85) 100%)',
  fonts: {
    eventName: {
      size: 54,
      weight: 900,
      color: '#00f2ff',
      letterSpacing: 0.08,
    },
    eventType: {
      size: 40,
      weight: 700,
      color: '#a78bfa',
      letterSpacing: 0.12,
    },
    record: {
      size: 200,
      weight: 400,
      color: '#00f2ff',
      letterSpacing: 0.12,
    },
    comment: {
      size: 36,
      weight: 600,
      color: '#a78bfa',
      letterSpacing: 0.05,
    },
  },
  layout: {
    eventNameX: 0.5,   // 中央
    eventNameY: 0.18,
    eventTypeX: 0.5,   // 中央
    eventTypeY: 0.30,
    recordX: 0.5,      // 中央
    recordY: 0.52,
    commentX: 0.5,     // 中央
    commentY: 0.80,
    recordRotation: 0,
  },
  style: {
    recordOutline: true,
    recordShadow: true,
    accentColor: '#00f2ff',
  },
};

// テンプレート⑥：エレガント・ホワイト
// 白基調のミニマルデザイン
export const elegantTemplate: Template = {
  id: 'elegant',
  name: 'エレガント',
  description: '白基調・清潔感・ミニマル',
  overlay: 'rgba(255, 255, 255, 0.35)',
  overlayGradient: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.65) 100%)',
  fonts: {
    eventName: {
      size: 52,
      weight: 400,
      color: '#0a0a0a',
      letterSpacing: 0.12,
    },
    eventType: {
      size: 38,
      weight: 500,
      color: '#525252',
      letterSpacing: 0.25,
    },
    record: {
      size: 150,
      weight: 700,
      color: '#0a0a0a',
      letterSpacing: 0.08,
    },
    comment: {
      size: 34,
      weight: 400,
      color: '#737373',
      letterSpacing: 0.08,
    },
  },
  layout: {
    eventNameY: 0.24,
    eventTypeY: 0.36,
    recordY: 0.56,
    commentY: 0.80,
    recordRotation: 0,
  },
  style: {
    recordOutline: false,
    recordShadow: false,
    accentColor: '#0a0a0a',
  },
};

// テンプレート⑦：ゴールド・プレミアム
// 金色をアクセントにした高級感のあるデザイン
export const goldTemplate: Template = {
  id: 'gold',
  name: 'ゴールド',
  description: '金色アクセント・プレミアム',
  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayGradient: 'linear-gradient(180deg, rgba(184,134,11,0.1) 0%, rgba(0,0,0,0.75) 100%)',
  fonts: {
    eventName: {
      size: 56,
      weight: 800,
      color: '#fbbf24',
      letterSpacing: 0.03,
    },
    eventType: {
      size: 44,
      weight: 600,
      color: '#ffffff',
      letterSpacing: 0.05,
    },
    record: {
      size: 175,
      weight: 500,
      color: '#fbbf24',
      letterSpacing: 0.1,
    },
    comment: {
      size: 38,
      weight: 500,
      color: '#fcd34d',
      letterSpacing: 0.05,
    },
  },
  layout: {
    eventNameX: 0.5,
    eventNameY: 0.20,
    eventTypeX: 0.5,
    eventTypeY: 0.32,
    recordX: 0.5,
    recordY: 0.52,
    commentX: 0.5,
    commentY: 0.76,
    recordRotation: -6,
  },
  style: {
    recordOutline: true,
    recordShadow: true,
    accentColor: '#fbbf24',
  },
};

// テンプレート⑧：レトロ・ビンテージ
// 80-90年代のレトロな雰囲気
export const retroTemplate: Template = {
  id: 'retro',
  name: 'レトロ',
  description: '80-90年代・ビンテージ',
  overlay: 'rgba(0, 0, 0, 0.45)',
  overlayGradient: 'linear-gradient(180deg, rgba(139,69,19,0.2) 0%, rgba(0,0,0,0.6) 100%)',
  fonts: {
    eventName: {
      size: 54,
      weight: 700,
      color: '#f97316',
      letterSpacing: 0.05,
    },
    eventType: {
      size: 42,
      weight: 600,
      color: '#fb923c',
      letterSpacing: 0.1,
    },
    record: {
      size: 170,
      weight: 600,
      color: '#f97316',
      letterSpacing: 0.12,
    },
    comment: {
      size: 36,
      weight: 500,
      color: '#fb923c',
      letterSpacing: 0.05,
    },
  },
  layout: {
    eventNameX: 0.5,
    eventNameY: 0.22,
    eventTypeX: 0.5,
    eventTypeY: 0.34,
    recordX: 0.5,
    recordY: 0.54,
    commentX: 0.5,
    commentY: 0.78,
    recordRotation: -5,
  },
  style: {
    recordOutline: true,
    recordShadow: true,
    accentColor: '#f97316',
  },
};

// テンプレート⑨：モノクロ・クラシック
// 白黒のクラシックなデザイン
export const monochromeTemplate: Template = {
  id: 'monochrome',
  name: 'モノクロ',
  description: '白黒・クラシック',
  overlay: 'rgba(0, 0, 0, 0.50)',
  overlayGradient: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.7) 100%)',
  fonts: {
    eventName: {
      size: 52,
      weight: 700,
      color: '#ffffff',
      letterSpacing: 0.04,
    },
    eventType: {
      size: 40,
      weight: 500,
      color: '#d4d4d4',
      letterSpacing: 0.08,
    },
    record: {
      size: 160,
      weight: 700,
      color: '#ffffff',
      letterSpacing: 0.06,
    },
    comment: {
      size: 34,
      weight: 400,
      color: '#a3a3a3',
      letterSpacing: 0.05,
    },
  },
  layout: {
    eventNameX: 0.5,
    eventNameY: 0.23,
    eventTypeX: 0.5,
    eventTypeY: 0.35,
    recordX: 0.5,
    recordY: 0.55,
    commentX: 0.5,
    commentY: 0.79,
    recordRotation: 0,
  },
  style: {
    recordOutline: true,
    recordShadow: true,
    accentColor: '#ffffff',
  },
};

// テンプレート⑩：パステル・ソフト
// 優しいパステルカラーのデザイン
export const pastelTemplate: Template = {
  id: 'pastel',
  name: 'パステル',
  description: '優しい色・ソフト',
  overlay: 'rgba(0, 0, 0, 0.35)',
  overlayGradient: 'linear-gradient(180deg, rgba(147,197,253,0.15) 0%, rgba(0,0,0,0.5) 100%)',
  fonts: {
    eventName: {
      size: 50,
      weight: 600,
      color: '#fef3c7',
      letterSpacing: 0.05,
    },
    eventType: {
      size: 38,
      weight: 500,
      color: '#ddd6fe',
      letterSpacing: 0.1,
    },
    record: {
      size: 155,
      weight: 600,
      color: '#fef3c7',
      letterSpacing: 0.08,
    },
    comment: {
      size: 34,
      weight: 400,
      color: '#e0e7ff',
      letterSpacing: 0.05,
    },
  },
  layout: {
    eventNameX: 0.52,  // やや右寄り
    eventNameY: 0.24,
    eventTypeX: 0.48,  // やや左寄り
    eventTypeY: 0.36,
    recordX: 0.5,      // 中央
    recordY: 0.56,
    commentX: 0.5,     // 中央
    commentY: 0.80,
    recordRotation: 0,
  },
  style: {
    recordOutline: false,
    recordShadow: true,
    accentColor: '#fef3c7',
  },
};

// 利用可能なテンプレート一覧
export const templates: Template[] = [
  dovaTemplate,
  simpleTemplate,
  magazineTemplate,
  ekidenTemplate,
  cyberTemplate,
  elegantTemplate,
  goldTemplate,
  retroTemplate,
  monochromeTemplate,
  pastelTemplate,
];

// デフォルトテンプレート
export const defaultTemplate = dovaTemplate;

// IDでテンプレートを取得
export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id);
};
