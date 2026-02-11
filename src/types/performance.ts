/**
 * 性能监控相关类型定义
 * 用于 Web Vitals 性能指标收集
 */

/**
 * Web Vitals 指标评级
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * 指标阈值配置
 */
export interface MetricThreshold {
  /** 良好阈值 */
  good: number;
  /** 较差阈值 */
  poor: number;
}

/**
 * 性能数据上报请求体（与后端 page_performance 字段对齐）
 */
export interface PerfReportPayload {
  pageUrl: string;
  visitorId?: string;
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  navigationType?: string;
  duration?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  browser?: string;
  os?: string;
  device?: string;
}

/**
 * 服务端单条性能记录（GET /api/perf 返回的 data.rows 元素）
 */
export interface PerfRecord {
  id: number;
  pageUrl: string;
  visitorId: string | null;
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  navigationType: string | null;
  duration: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  screenWidth: number | null;
  screenHeight: number | null;
  createDate: string;
}

/**
 * 性能列表接口返回的 data 结构
 */
export interface PerfListData {
  total: number;
  rows: PerfRecord[];
}
