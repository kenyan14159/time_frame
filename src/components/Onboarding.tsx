import { useState, useEffect, useLayoutEffect, useRef } from 'react';

const STORAGE_KEY = 'timeframe-onboarding-completed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID
  position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: OnboardingStep[] = [
  {
    id: 'record',
    title: '記録を入力',
    description: 'あなたの記録やタイムを入力してください。これが画像のメインになります。',
    target: '#record',
    position: 'bottom',
  },
  {
    id: 'background',
    title: '背景画像をアップロード',
    description: 'リザルト画面や走っている写真をドラッグ＆ドロップで追加できます。',
    target: '#backgroundImage',
    position: 'top',
  },
  {
    id: 'template',
    title: 'テンプレートを選択',
    description: '10種類以上のスタイルから好みのデザインを選べます。',
    target: '.template-selector',
    position: 'right',
  },
  {
    id: 'customize',
    title: 'カスタマイズ',
    description: 'フォント、色、フィルターなどを細かく調整できます。',
    target: '.customize-panel',
    position: 'right',
  },
  {
    id: 'download',
    title: 'ダウンロード＆シェア',
    description: '完成したらダウンロードしてSNSでシェアしましょう！',
    target: '.download-button',
    position: 'top',
  },
];

interface TooltipProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

function Tooltip({ step, currentStep, totalSteps, onNext, onSkip, onPrev }: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // useLayoutEffectでDOM測定後に位置を更新（レンダリング前に同期的に実行）
  useLayoutEffect(() => {
    const updatePosition = () => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = rect.top + scrollTop - 10;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + scrollTop + 10;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.left + scrollLeft - 10;
            break;
          case 'right':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.right + scrollLeft + 10;
            break;
        }

        setPosition({ top, left });

        // 要素までスクロール
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // 少し遅延させて要素が確実に存在することを保証
    const timer = setTimeout(updatePosition, 100);
    return () => clearTimeout(timer);
  }, [step]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-[100] animate-fade-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className={`absolute ${positionClasses[step.position]} w-72 bg-surface border border-accent rounded-xl shadow-2xl p-4`}>
        {/* ステップインジケーター */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-accent font-medium">
            {currentStep + 1} / {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            スキップ
          </button>
        </div>

        {/* タイトル */}
        <h4 className="text-sm font-bold text-text-primary mb-1">
          {step.title}
        </h4>

        {/* 説明 */}
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          {step.description}
        </p>

        {/* ボタン */}
        <div className="flex justify-between items-center">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="text-xs text-text-muted hover:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            戻る
          </button>
          <button
            onClick={onNext}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors"
          >
            {currentStep === totalSteps - 1 ? '完了' : '次へ'}
          </button>
        </div>

        {/* 矢印 */}
        <div 
          className={`absolute w-3 h-3 bg-surface border-accent rotate-45 ${
            step.position === 'top' ? 'top-full -mt-1.5 left-1/2 -translate-x-1/2 border-b border-r' :
            step.position === 'bottom' ? 'bottom-full -mb-1.5 left-1/2 -translate-x-1/2 border-t border-l' :
            step.position === 'left' ? 'left-full -ml-1.5 top-1/2 -translate-y-1/2 border-t border-r' :
            'right-full -mr-1.5 top-1/2 -translate-y-1/2 border-b border-l'
          }`}
        />
      </div>
    </div>
  );
}

export function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // 初回訪問チェック
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // 少し遅延させて表示
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/60 z-[99]"
        onClick={handleSkip}
      />
      
      {/* ツールチップ */}
      <Tooltip
        step={steps[currentStep]}
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
      />
    </>
  );
}

