import { NUMBER_FONTS, JAPANESE_FONTS, OUTPUT_SIZE_PRESETS, type CustomizeSettings, type TextLayoutSettings } from '../types';

// レイアウト更新のヘルパー関数
const updateLayout = (
  currentLayout: TextLayoutSettings | undefined,
  updates: Partial<TextLayoutSettings>
): TextLayoutSettings => {
  return {
    eventNameX: currentLayout?.eventNameX ?? 0.5,
    eventNameY: currentLayout?.eventNameY ?? 0.3,
    eventTypeX: currentLayout?.eventTypeX ?? 0.5,
    eventTypeY: currentLayout?.eventTypeY ?? 0.4,
    recordX: currentLayout?.recordX ?? 0.5,
    recordY: currentLayout?.recordY ?? 0.5,
    commentX: currentLayout?.commentX ?? 0.5,
    commentY: currentLayout?.commentY ?? 0.7,
    eventNameSize: currentLayout?.eventNameSize ?? 100,
    eventTypeSize: currentLayout?.eventTypeSize ?? 100,
    recordSize: currentLayout?.recordSize ?? 100,
    commentSize: currentLayout?.commentSize ?? 100,
    ...currentLayout,
    ...updates,
  };
};

interface CustomizeSettingsProps {
  settings: CustomizeSettings;
  onSettingsChange: (settings: Partial<CustomizeSettings>) => void;
}

export function CustomizeSettingsPanel({ settings, onSettingsChange }: CustomizeSettingsProps) {
  return (
    <div className="space-y-6">
      {/* フォント選択 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          フォント
        </h3>
        
        {/* タイム用（数字・英字） */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">
            タイム用（数字・英字）
          </label>
          <select
            value={settings.numberFontId}
            onChange={(e) => onSettingsChange({ numberFontId: e.target.value as CustomizeSettings['numberFontId'] })}
            aria-label="タイム用フォントを選択"
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg 
                       text-text-primary text-sm
                       focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                       transition-colors cursor-pointer"
          >
            {NUMBER_FONTS.map(font => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* 日本語テキスト用 */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5">
            日本語テキスト用
          </label>
          <select
            value={settings.japaneseFontId}
            onChange={(e) => onSettingsChange({ japaneseFontId: e.target.value as CustomizeSettings['japaneseFontId'] })}
            aria-label="日本語フォントを選択"
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg 
                       text-text-primary text-sm
                       focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                       transition-colors cursor-pointer"
          >
            {JAPANESE_FONTS.map(font => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 出力サイズ選択 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          出力サイズ
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {OUTPUT_SIZE_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSettingsChange({ outputSizeId: preset.id })}
              aria-label={`${preset.name}を選択`}
              aria-pressed={settings.outputSizeId === preset.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
                ${settings.outputSizeId === preset.id 
                  ? 'border-accent bg-accent/10 text-text-primary' 
                  : 'border-border bg-surface hover:border-accent/50 text-text-secondary'}`}
            >
              <span className="font-medium">{preset.name}</span>
              <span className="text-xs text-text-muted">{preset.width}×{preset.height}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 文字色 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          文字カラー
        </label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={settings.textColor}
              onChange={(e) => onSettingsChange({ textColor: e.target.value })}
              aria-label="文字色を選択"
              className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
            <input
              type="text"
              value={settings.textColor}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  onSettingsChange({ textColor: value });
                }
              }}
              placeholder="#ffffff"
              aria-label="文字色を16進数で入力"
              className="flex-1 px-3 py-2.5 bg-surface border border-border rounded-lg 
                         text-text-primary placeholder-text-muted font-mono text-sm
                         focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                         transition-colors"
            />
          {/* クイックカラーパレット */}
          <div className="flex gap-1">
            {['#ffffff', '#ffdd00', '#ff3b30', '#4ecdc4'].map(color => (
              <button
                key={color}
                type="button"
                onClick={() => onSettingsChange({ textColor: color })}
                className={`w-7 h-7 rounded-md border transition-transform hover:scale-110
                  ${settings.textColor === color ? 'border-accent ring-1 ring-accent' : 'border-border'}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* グレースケール */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          画像フィルター
        </label>
        
        <div className="space-y-4">
          {/* 白黒 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">グレースケール</span>
              <span className="text-accent font-medium">{settings.grayscale}%</span>
            </div>
            <input
              type="range" min="0" max="100"
              value={settings.grayscale}
              onChange={(e) => onSettingsChange({ grayscale: Number(e.target.value) })}
              aria-label="グレースケール"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={settings.grayscale}
              className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
            />
          </div>

          {/* 明るさ */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">明るさ</span>
              <span className="text-accent font-medium">{settings.brightness}%</span>
            </div>
            <input
              type="range" min="0" max="200"
              value={settings.brightness}
              onChange={(e) => onSettingsChange({ brightness: Number(e.target.value) })}
              aria-label="明るさ"
              aria-valuemin={0}
              aria-valuemax={200}
              aria-valuenow={settings.brightness}
              className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
            />
          </div>

          {/* コントラスト */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">コントラスト</span>
              <span className="text-accent font-medium">{settings.contrast}%</span>
            </div>
            <input
              type="range" min="0" max="200"
              value={settings.contrast}
              onChange={(e) => onSettingsChange({ contrast: Number(e.target.value) })}
              aria-label="コントラスト"
              aria-valuemin={0}
              aria-valuemax={200}
              aria-valuenow={settings.contrast}
              className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
            />
          </div>

          {/* ぼかし */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">ぼかし</span>
              <span className="text-accent font-medium">{settings.blur}px</span>
            </div>
            <input
              type="range" min="0" max="20" step="0.5"
              value={settings.blur}
              onChange={(e) => onSettingsChange({ blur: Number(e.target.value) })}
              aria-label="ぼかし"
              aria-valuemin={0}
              aria-valuemax={20}
              aria-valuenow={settings.blur}
              className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* テキスト位置とサイズ */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          テキスト位置とサイズ
        </label>
        
        <div className="space-y-4">
          {/* 大会名 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">大会名</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">位置</span>
                  <span className="text-accent font-medium">
                    {Math.round((settings.textLayout?.eventNameY ?? 0.3) * 100)}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={((settings.textLayout?.eventNameY ?? 0.3) * 100)}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { eventNameY: Number(e.target.value) / 100 });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">サイズ</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.eventNameSize ?? 100}%
                  </span>
                </div>
                <input
                  type="range" min="50" max="200" step="5"
                  value={settings.textLayout?.eventNameSize ?? 100}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { eventNameSize: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 種目/場所 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">種目/場所</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">位置</span>
                  <span className="text-accent font-medium">
                    {Math.round((settings.textLayout?.eventTypeY ?? 0.4) * 100)}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={((settings.textLayout?.eventTypeY ?? 0.4) * 100)}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { eventTypeY: Number(e.target.value) / 100 });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">サイズ</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.eventTypeSize ?? 100}%
                  </span>
                </div>
                <input
                  type="range" min="50" max="200" step="5"
                  value={settings.textLayout?.eventTypeSize ?? 100}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { eventTypeSize: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 記録 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">記録</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">位置</span>
                  <span className="text-accent font-medium">
                    {Math.round((settings.textLayout?.recordY ?? 0.5) * 100)}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={((settings.textLayout?.recordY ?? 0.5) * 100)}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { recordY: Number(e.target.value) / 100 });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">サイズ</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.recordSize ?? 100}%
                  </span>
                </div>
                <input
                  type="range" min="50" max="200" step="5"
                  value={settings.textLayout?.recordSize ?? 100}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { recordSize: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* コメント */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">コメント</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">位置</span>
                  <span className="text-accent font-medium">
                    {Math.round((settings.textLayout?.commentY ?? 0.7) * 100)}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={((settings.textLayout?.commentY ?? 0.7) * 100)}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { commentY: Number(e.target.value) / 100 });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">サイズ</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.commentSize ?? 100}%
                  </span>
                </div>
                <input
                  type="range" min="50" max="200" step="5"
                  value={settings.textLayout?.commentSize ?? 100}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { commentSize: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* テキスト色と回転 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          テキスト色と回転
        </label>
        
        <div className="space-y-4">
          {/* 大会名 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-muted">大会名</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">色</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.textLayout?.eventNameColor || settings.textColor}
                    onChange={(e) => {
                      const newLayout = updateLayout(settings.textLayout, { eventNameColor: e.target.value });
                      onSettingsChange({ textLayout: newLayout });
                    }}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    value={settings.textLayout?.eventNameColor || settings.textColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        const newLayout = updateLayout(settings.textLayout, { eventNameColor: value });
                        onSettingsChange({ textLayout: newLayout });
                      }
                    }}
                    placeholder="#ffffff"
                    className="flex-1 px-2 py-1.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted font-mono text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">回転</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.eventNameRotation ?? 0}°
                  </span>
                </div>
                <input
                  type="range" min="-45" max="45" step="1"
                  value={settings.textLayout?.eventNameRotation ?? 0}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { eventNameRotation: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 種目 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-muted">種目</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">色</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.textLayout?.eventTypeColor || settings.textColor}
                    onChange={(e) => {
                      const newLayout = updateLayout(settings.textLayout, { eventTypeColor: e.target.value });
                      onSettingsChange({ textLayout: newLayout });
                    }}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    value={settings.textLayout?.eventTypeColor || settings.textColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        const newLayout = updateLayout(settings.textLayout, { eventTypeColor: value });
                        onSettingsChange({ textLayout: newLayout });
                      }
                    }}
                    placeholder="#ffffff"
                    className="flex-1 px-2 py-1.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted font-mono text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">回転</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.eventTypeRotation ?? 0}°
                  </span>
                </div>
                <input
                  type="range" min="-45" max="45" step="1"
                  value={settings.textLayout?.eventTypeRotation ?? 0}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { eventTypeRotation: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 記録 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-muted">記録</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">色</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.textLayout?.recordColor || settings.textColor}
                    onChange={(e) => {
                      const newLayout = updateLayout(settings.textLayout, { recordColor: e.target.value });
                      onSettingsChange({ textLayout: newLayout });
                    }}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    value={settings.textLayout?.recordColor || settings.textColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        const newLayout = updateLayout(settings.textLayout, { recordColor: value });
                        onSettingsChange({ textLayout: newLayout });
                      }
                    }}
                    placeholder="#ffffff"
                    className="flex-1 px-2 py-1.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted font-mono text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">回転</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.recordRotation ?? 0}°
                  </span>
                </div>
                <input
                  type="range" min="-45" max="45" step="1"
                  value={settings.textLayout?.recordRotation ?? 0}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { recordRotation: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* コメント */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-muted">コメント</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">色</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.textLayout?.commentColor || (settings.textColor + 'dd')}
                    onChange={(e) => {
                      const newLayout = updateLayout(settings.textLayout, { commentColor: e.target.value });
                      onSettingsChange({ textLayout: newLayout });
                    }}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    value={settings.textLayout?.commentColor || (settings.textColor + 'dd')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,8}$/.test(value)) {
                        const newLayout = updateLayout(settings.textLayout, { commentColor: value });
                        onSettingsChange({ textLayout: newLayout });
                      }
                    }}
                    placeholder="#ffffffdd"
                    className="flex-1 px-2 py-1.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted font-mono text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">回転</span>
                  <span className="text-accent font-medium">
                    {settings.textLayout?.commentRotation ?? 0}°
                  </span>
                </div>
                <input
                  type="range" min="-45" max="45" step="1"
                  value={settings.textLayout?.commentRotation ?? 0}
                  onChange={(e) => {
                    const newLayout = updateLayout(settings.textLayout, { commentRotation: Number(e.target.value) });
                    onSettingsChange({ textLayout: newLayout });
                  }}
                  className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
