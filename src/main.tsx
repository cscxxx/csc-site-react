import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { appLocale } from './config/locale';
import './config/dayjs';
import './index.css';
import App from './App.tsx';
import { themeConfig } from './config/theme';
import { initGlobalErrorHandler } from './utils/error/globalHandler';
import { initWebVitals } from './utils/performance/vitals';

// 初始化全局错误监听
initGlobalErrorHandler();

// 延后执行性能监控，避免与首屏渲染争抢主线程
const scheduleWebVitals = (): void => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => initWebVitals(), { timeout: 3000 });
  } else {
    setTimeout(initWebVitals, 0);
  }
};
scheduleWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={appLocale} theme={themeConfig}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
