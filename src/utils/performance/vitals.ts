/**
 * Web Vitals 性能监控与上报
 * 收集 Core Web Vitals，在页面离开时 POST /api/perf 上报一条记录
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import type { PerfReportPayload } from '@/types';

const VISITOR_ID_KEY = 'csc-site-visitor-id';
const PERF_API = '/api/perf';

/**
 * 生成或读取持久化的匿名访客 ID
 */
function getOrCreateVisitorId(): string {
  try {
    const stored = localStorage.getItem(VISITOR_ID_KEY);
    if (stored) return stored;
    const id = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * 从 User-Agent 解析 browser / os / device（极简实现，无 any）
 */
function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  const u = ua;
  let browser = 'Unknown';
  if (u.includes('Edg/')) browser = 'Edge ' + (u.match(/Edg\/(\d+)/)?.[1] ?? '');
  else if (u.includes('Chrome/') && !u.includes('Chromium')) browser = 'Chrome ' + (u.match(/Chrome\/(\d+)/)?.[1] ?? '');
  else if (u.includes('Firefox/')) browser = 'Firefox ' + (u.match(/Firefox\/(\d+)/)?.[1] ?? '');
  else if (u.includes('Safari/') && u.includes('Version/')) browser = 'Safari ' + (u.match(/Version\/(\d+)/)?.[1] ?? '');

  let os = 'Unknown';
  if (u.includes('Windows')) os = 'Windows';
  else if (u.includes('Mac OS')) os = u.match(/Mac OS X (\d+[._]\d+)/)?.[0] ?? 'Mac OS';
  else if (u.includes('Linux')) os = 'Linux';
  else if (u.includes('Android')) os = 'Android';
  else if (u.includes('iPhone') || u.includes('iPad')) os = 'iOS';

  let device = 'desktop';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(u)) {
    device = u.includes('iPad') || (u.includes('Mac') && u.includes('Safari') && /Touch/.test(u)) ? 'tablet' : 'mobile';
  }
  return { browser, os, device };
}

/**
 * 获取当前页面环境信息（仅调用一次）
 */
function getEnvInfo(): Pick<
  PerfReportPayload,
  'pageUrl' | 'viewportWidth' | 'viewportHeight' | 'screenWidth' | 'screenHeight' | 'navigationType' | 'browser' | 'os' | 'device'
> {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const { browser, os, device } = parseUserAgent(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return {
    pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : undefined,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : undefined,
    navigationType: nav?.type ?? 'navigate',
    browser,
    os,
    device,
  };
}

/** 当次访问的 payload 缓存 */
let reportPayload: Partial<PerfReportPayload> = {};
/** 页面加载时间，用于计算 duration */
let loadTime = 0;

/**
 * 上报一条性能记录到服务端（离开时调用）
 */
function sendReport(): void {
  const payload: PerfReportPayload = {
    pageUrl: reportPayload.pageUrl ?? (typeof window !== 'undefined' ? window.location.href : ''),
    visitorId: reportPayload.visitorId ?? getOrCreateVisitorId(),
    lcp: reportPayload.lcp,
    fid: reportPayload.fid,
    cls: reportPayload.cls,
    fcp: reportPayload.fcp,
    ttfb: reportPayload.ttfb,
    navigationType: reportPayload.navigationType,
    duration: reportPayload.duration,
    viewportWidth: reportPayload.viewportWidth,
    viewportHeight: reportPayload.viewportHeight,
    screenWidth: reportPayload.screenWidth,
    screenHeight: reportPayload.screenHeight,
    browser: reportPayload.browser,
    os: reportPayload.os,
    device: reportPayload.device,
  };

  const body = JSON.stringify(payload);
  const url = typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}${PERF_API}` : PERF_API;

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  }
}

/**
 * 在页面离开或隐藏时补全 duration 并上报
 */
function flushReport(): void {
  reportPayload.duration = loadTime ? Date.now() - loadTime : undefined;
  sendReport();
}

/**
 * Web Vitals 指标回调：写入内存 payload，INP 映射为 fid
 */
function onMetricReport(metric: Metric): void {
  const name = metric.name;
  const value = metric.value;
  if (name === 'LCP') reportPayload.lcp = value;
  else if (name === 'INP') reportPayload.fid = value;
  else if (name === 'CLS') reportPayload.cls = value;
  else if (name === 'FCP') reportPayload.fcp = value;
  else if (name === 'TTFB') reportPayload.ttfb = value;
}

/**
 * 初始化 Web Vitals 监控
 *
 * 收集 LCP、INP(作为 fid)、CLS、FCP、TTFB，在 beforeunload / pagehide / visibilitychange(hidden) 时
 * 汇总为一条记录 POST /api/perf 上报。
 *
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  loadTime = Date.now();
  const env = getEnvInfo();
  reportPayload = {
    pageUrl: env.pageUrl,
    visitorId: getOrCreateVisitorId(),
    viewportWidth: env.viewportWidth,
    viewportHeight: env.viewportHeight,
    screenWidth: env.screenWidth,
    screenHeight: env.screenHeight,
    navigationType: env.navigationType,
    browser: env.browser,
    os: env.os,
    device: env.device,
  };

  onCLS(onMetricReport);
  onFCP(onMetricReport);
  onINP(onMetricReport);
  onLCP(onMetricReport);
  onTTFB(onMetricReport);

  const boundFlush = (): void => {
    flushReport();
  };

  window.addEventListener('beforeunload', boundFlush);
  window.addEventListener('pagehide', boundFlush);
  const visHandler = (): void => {
    if (document.visibilityState === 'hidden') boundFlush();
  };
  document.addEventListener('visibilitychange', visHandler);
}
