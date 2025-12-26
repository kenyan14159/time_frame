import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { logger } from './utils/logger'
import { reportWebVitals, sendToAnalytics } from './utils/webVitals'

// Service Worker登録（PWA対応）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        logger.error('Service Worker registration failed', error);
      });
  });
}

// Web Vitalsの計測開始
reportWebVitals(sendToAnalytics);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
