import type { Template } from '../types';
import { templates } from '../templates';

interface TemplateSelectorProps {
  selectedTemplate: Template;
  onSelectTemplate: (template: Template) => void;
}

// テンプレートのビジュアルプレビューコンポーネント
function TemplatePreview({ template }: { template: Template }) {
  const { fonts, layout, style } = template;
  const rotation = layout.recordRotation || 0;
  
  return (
    <div 
      className="w-full h-16 rounded-md overflow-hidden relative"
      style={{
        background: template.id === 'elegant' 
          ? 'linear-gradient(180deg, #e5e5e5 0%, #f5f5f5 100%)'
          : template.overlayGradient 
            ? `linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)`
            : '#1a1a1a',
      }}
    >
      {/* オーバーレイ効果 */}
      <div 
        className="absolute inset-0"
        style={{
          background: template.overlayGradient || template.overlay,
          opacity: 0.7,
        }}
      />
      
      {/* サンプルテキスト */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* 大会名サンプル */}
        <div 
          className="text-[8px] font-semibold truncate max-w-[90%]"
          style={{ color: fonts.eventName.color }}
        >
          日体大記録会
        </div>
        
        {/* 記録サンプル */}
        <div 
          className="text-sm font-bold"
          style={{ 
            color: fonts.record.color,
            transform: `rotate(${rotation}deg)`,
            textShadow: style.recordShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          28:30
        </div>
        
        {/* 種目サンプル */}
        <div 
          className="text-[7px] truncate max-w-[90%]"
          style={{ color: fonts.eventType.color }}
        >
          10000m
        </div>
      </div>
      
      {/* アクセントカラーバー */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: style.accentColor }}
      />
    </div>
  );
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        テンプレート
      </h3>
      
      <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            aria-label={`${template.name}テンプレートを選択`}
            aria-pressed={selectedTemplate.id === template.id}
            className={`
              relative rounded-lg border transition-all text-left overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
              ${selectedTemplate.id === template.id
                ? 'border-accent bg-accent/10 ring-1 ring-accent'
                : 'border-border bg-surface hover:border-accent/50'
              }
            `}
          >
            {/* ビジュアルプレビュー */}
            <TemplatePreview template={template} />
            
            {/* テンプレート情報 */}
            <div className="px-3 py-2">
              {/* テンプレート名 */}
              <div className={`text-sm font-semibold mb-0.5
                ${selectedTemplate.id === template.id ? 'text-text-primary' : 'text-text-secondary'}
              `}>
                {template.name}
              </div>
              
              {/* 説明 */}
              <div className="text-xs text-text-muted line-clamp-1">
                {template.description}
              </div>
            </div>

            {/* 選択インジケーター */}
            {selectedTemplate.id === template.id && (
              <div className="absolute top-2 right-2 bg-accent rounded-full p-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
