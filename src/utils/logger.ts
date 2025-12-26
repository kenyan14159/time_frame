/**
 * ロガーユーティリティ
 * 本番環境ではconsole出力を無効化し、エラートラッキングサービスに送信可能
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  /**
   * 開発環境でのみログを出力
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },

  /**
   * エラーログ（開発環境ではconsole.error、本番環境ではエラートラッキングサービスに送信可能）
   */
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.error('[ERROR]', message, error, context);
    } else if (isProduction) {
      // 本番環境ではエラートラッキングサービス（Sentry等）に送信
      // TODO: エラートラッキングサービスを導入する場合はここに実装
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, { extra: context });
      // }
    }
  },

  /**
   * 警告ログ
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * 情報ログ
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
};

