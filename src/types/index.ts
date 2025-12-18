// フォント選択肢（数字・英字用）
export const NUMBER_FONTS = [
  { id: 'bebas-neue', name: 'Bebas Neue', family: '"Bebas Neue", sans-serif' },
  { id: 'anton', name: 'Anton', family: '"Anton", sans-serif' },
  { id: 'oswald', name: 'Oswald', family: '"Oswald", sans-serif' },
  { id: 'montserrat', name: 'Montserrat', family: '"Montserrat", sans-serif' },
  { id: 'inter', name: 'Inter', family: 'Inter, system-ui, sans-serif' },
  { id: 'roboto', name: 'Roboto', family: '"Roboto", sans-serif' },
  { id: 'raleway', name: 'Raleway', family: '"Raleway", sans-serif' },
  { id: 'poppins', name: 'Poppins', family: '"Poppins", sans-serif' },
  { id: 'playfair-display', name: 'Playfair Display', family: '"Playfair Display", serif' },
  { id: 'lato', name: 'Lato', family: '"Lato", sans-serif' },
  { id: 'open-sans', name: 'Open Sans', family: '"Open Sans", sans-serif' },
  { id: 'rubik', name: 'Rubik', family: '"Rubik", sans-serif' },
  { id: 'nunito', name: 'Nunito', family: '"Nunito", sans-serif' },
  { id: 'source-sans-pro', name: 'Source Sans Pro', family: '"Source Sans Pro", sans-serif' },
] as const;

// フォント選択肢（日本語用）
export const JAPANESE_FONTS = [
  { id: 'noto-sans-jp', name: 'Noto Sans JP', family: '"Noto Sans JP", sans-serif' },
  { id: 'zen-kaku-gothic', name: 'Zen Kaku Gothic New', family: '"Zen Kaku Gothic New", sans-serif' },
  { id: 'kosugi-maru', name: 'Kosugi Maru', family: '"Kosugi Maru", sans-serif' },
  { id: 'm-plus-rounded-1c', name: 'M PLUS Rounded 1c', family: '"M PLUS Rounded 1c", sans-serif' },
  { id: 'm-plus-1p', name: 'M PLUS 1p', family: '"M PLUS 1p", sans-serif' },
  { id: 'sawarabi-gothic', name: 'Sawarabi Gothic', family: '"Sawarabi Gothic", sans-serif' },
  { id: 'noto-serif-jp', name: 'Noto Serif JP', family: '"Noto Serif JP", serif' },
  { id: 'shippori-mincho', name: 'Shippori Mincho', family: '"Shippori Mincho", serif' },
  { id: 'yusei-magic', name: 'Yusei Magic', family: '"Yusei Magic", sans-serif' },
  { id: 'kiwi-maru', name: 'Kiwi Maru', family: '"Kiwi Maru", serif' },
] as const;

export type NumberFontId = typeof NUMBER_FONTS[number]['id'];
export type JapaneseFontId = typeof JAPANESE_FONTS[number]['id'];

// 出力サイズのプリセット
export const OUTPUT_SIZE_PRESETS = [
  { id: 'instagram-post', name: 'Instagram 投稿', width: 1080, height: 1080, aspectRatio: '1:1' },
  { id: 'instagram-story', name: 'Instagram ストーリー', width: 1080, height: 1920, aspectRatio: '9:16' },
  { id: 'twitter-post', name: 'X (Twitter) 投稿', width: 1200, height: 675, aspectRatio: '16:9' },
  { id: 'wallpaper-phone', name: '壁紙 (スマホ)', width: 1080, height: 2340, aspectRatio: '9:19.5' },
  { id: 'wallpaper-desktop', name: '壁紙 (デスクトップ)', width: 1920, height: 1080, aspectRatio: '16:9' },
] as const;

export type OutputSizeId = typeof OUTPUT_SIZE_PRESETS[number]['id'];

// フォーム入力データの型定義
export interface FormData {
  eventName: string;      // 大会名（必須）
  eventType: string;      // 種目（必須）
  record: string;         // 記録（必須）
  backgroundImage: File | null;  // 背景画像（必須）
  comment: string;        // 一言コメント（任意、最大30文字）
}

// テキスト位置とサイズのカスタマイズ設定
export interface TextLayoutSettings {
  eventNameX?: number;   // 大会名のX位置（0-1、デフォルト0.5=中央）
  eventNameY: number;    // 大会名のY位置（0-1）
  eventTypeX?: number;   // 種目のX位置（0-1、デフォルト0.5=中央）
  eventTypeY: number;    // 種目のY位置（0-1）
  recordX?: number;      // 記録のX位置（0-1、デフォルト0.5=中央）
  recordY: number;       // 記録のY位置（0-1）
  commentX?: number;     // コメントのX位置（0-1、デフォルト0.5=中央）
  commentY: number;     // コメントのY位置（0-1）
  eventNameSize: number; // 大会名のフォントサイズ（相対値、デフォルト100）
  eventTypeSize: number; // 種目のフォントサイズ（相対値、デフォルト100）
  recordSize: number;    // 記録のフォントサイズ（相対値、デフォルト100）
  commentSize: number;   // コメントのフォントサイズ（相対値、デフォルト100）
  eventNameColor?: string; // 大会名の色（オプション）
  eventTypeColor?: string; // 種目の色（オプション）
  recordColor?: string;    // 記録の色（オプション）
  commentColor?: string;   // コメントの色（オプション）
  eventNameRotation?: number; // 大会名の回転角度（度、オプション）
  eventTypeRotation?: number; // 種目の回転角度（度、オプション）
  recordRotation?: number;    // 記録の回転角度（度、オプション）
  commentRotation?: number;   // コメントの回転角度（度、オプション）
}

// カスタマイズ設定の型定義
export interface CustomizeSettings {
  numberFontId: NumberFontId;     // 数字・英字用フォント
  japaneseFontId: JapaneseFontId; // 日本語用フォント
  textColor: string;              // 文字色（HEX）
  grayscale: number;              // グレースケール（0-100）
  brightness: number;             // 明るさ（0-200, デフォルト100）
  contrast: number;               // コントラスト（0-200, デフォルト100）
  blur: number;                   // ぼかし（0-20）
  outputSizeId: OutputSizeId;     // 出力サイズプリセット
  textLayout?: TextLayoutSettings; // テキスト位置とサイズのカスタマイズ（オプション）
}

// デフォルトのカスタマイズ設定
export const DEFAULT_CUSTOMIZE_SETTINGS: CustomizeSettings = {
  numberFontId: 'bebas-neue',
  japaneseFontId: 'noto-sans-jp',
  textColor: '#ffffff',
  grayscale: 0,
  brightness: 100,
  contrast: 100,
  blur: 0,
  outputSizeId: 'instagram-post',
};

// フォント設定の型定義
export interface FontConfig {
  size: number;
  weight: number;
  color: string;
  letterSpacing?: number;  // letter-spacing (em単位)
}

// テンプレートのレイアウト設定
export interface LayoutConfig {
  eventNameX?: number;   // 大会名のX位置（0-1、デフォルト0.5=中央）
  eventNameY: number;   // 大会名のY位置
  eventTypeX?: number;   // 種目のX位置（0-1、デフォルト0.5=中央）
  eventTypeY: number;   // 種目のY位置
  recordX?: number;      // 記録のX位置（0-1、デフォルト0.5=中央）
  recordY: number;      // 記録のY位置（0-1の割合）
  commentX?: number;     // コメントのX位置（0-1、デフォルト0.5=中央）
  commentY: number;     // コメントのY位置
  recordRotation?: number; // タイムの回転角度（度）
}

// テンプレートの型定義
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  overlay: string;
  overlayGradient?: string;
  fonts: {
    eventName: FontConfig;
    record: FontConfig;
    eventType: FontConfig;
    comment: FontConfig;
  };
  layout: LayoutConfig;
  // テンプレート固有のスタイル
  style: {
    recordOutline?: boolean;      // タイムに縁取り
    recordShadow?: boolean;       // タイムにシャドウ
    accentColor?: string;         // アクセントカラー
  };
}

// 画像位置の型
export interface ImagePosition {
  x: number; // -1 to 1 (0 = center)
  y: number; // -1 to 1 (0 = center)
  scale: number; // 1 = fit, > 1 = zoom in
}

// デフォルトの画像位置
export const DEFAULT_IMAGE_POSITION: ImagePosition = {
  x: 0,
  y: 0,
  scale: 1,
};

// ステッカーの型
export interface Sticker {
  id: string;
  type: 'emoji' | 'logo' | 'custom';
  content: string; // emoji文字 or dataURL
  x: number; // 0-1
  y: number; // 0-1
  size: number; // px
  rotation: number; // degrees
}

// Canvas生成オプション
export interface CanvasOptions {
  width: number;
  height: number;
  quality: number;
}

// デフォルトのCanvasオプション（Instagram用）
export const DEFAULT_CANVAS_OPTIONS: CanvasOptions = {
  width: 1080,
  height: 1080,
  quality: 1.0,
};

// 出力サイズを取得
export const getOutputSize = (id: OutputSizeId) => {
  return OUTPUT_SIZE_PRESETS.find(preset => preset.id === id) || OUTPUT_SIZE_PRESETS[0];
};

// 数字用フォントファミリーを取得
export const getNumberFontFamily = (id: NumberFontId): string => {
  return NUMBER_FONTS.find(font => font.id === id)?.family || NUMBER_FONTS[0].family;
};

// 日本語用フォントファミリーを取得
export const getJapaneseFontFamily = (id: JapaneseFontId): string => {
  return JAPANESE_FONTS.find(font => font.id === id)?.family || JAPANESE_FONTS[0].family;
};
