/**
 * 性能监控指标配置与格式化 Hook
 */

import { useMemo } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { COLORS } from '@/styles/constants';

export type MetricInfoItem = {
  label: string;
  description: string;
  unit: string;
  thresholds: { good: number; poor: number };
};

const METRIC_INFO: Record<string, MetricInfoItem> = {
  LCP: {
    label: '最大内容绘制',
    description:
      'LCP（Largest Contentful Paint）最大内容绘制，测量从页面开始加载到视口内最大图片或文本块完成渲染的时间。反映用户感知的页面主要内容加载完成速度。良好 ≤2.5s，需改进 ≤4s，差 >4s。',
    unit: 'ms',
    thresholds: { good: 2500, poor: 4000 },
  },
  INP: {
    label: '交互到下次绘制',
    description:
      'INP（Interaction to Next Paint）交互到下次绘制，测量从用户与页面交互（点击、触摸、按键）到浏览器下一次绘制出视觉反馈的延迟。替代已弃用的 FID，更全面反映页面响应性。良好 ≤200ms，需改进 ≤500ms，差 >500ms。',
    unit: 'ms',
    thresholds: { good: 200, poor: 500 },
  },
  CLS: {
    label: '累积布局偏移',
    description:
      'CLS（Cumulative Layout Shift）累积布局偏移，测量页面整个生命周期内所有意外布局偏移的累计分数。由无尺寸的图片/广告、动态插入内容、字体加载导致元素位移，影响阅读与点击体验。良好 ≤0.1，需改进 ≤0.25，差 >0.25。',
    unit: '',
    thresholds: { good: 0.1, poor: 0.25 },
  },
  FCP: {
    label: '首次内容绘制',
    description:
      'FCP（First Contentful Paint）首次内容绘制，测量从页面开始加载到任意文本、图片、非白色 canvas 或 SVG 首次渲染的时间。反映用户首次看到内容的速度。良好 ≤1.8s，需改进 ≤3s，差 >3s。',
    unit: 'ms',
    thresholds: { good: 1800, poor: 3000 },
  },
  TTFB: {
    label: '首字节时间',
    description:
      'TTFB（Time to First Byte）首字节时间，测量从请求发出到浏览器收到响应第一个字节的时间。包含 DNS、连接、服务器处理等，反映服务器与网络响应速度。良好 ≤800ms，需改进 ≤1.8s，差 >1.8s。',
    unit: 'ms',
    thresholds: { good: 800, poor: 1800 },
  },
  FID: {
    label: '首次输入延迟',
    description:
      'FID（First Input Delay）首次输入延迟，测量从用户首次与页面交互到浏览器能够响应该交互的时间。反映主线程是否被长任务阻塞。后端使用与 INP 相同阈值：良好 ≤200ms，需改进 ≤500ms，差 >500ms。Chrome 已用 INP 替代 FID。',
    unit: 'ms',
    thresholds: { good: 200, poor: 500 },
  },
};

function getRatingFromValue(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const info = METRIC_INFO[name] ?? METRIC_INFO[name === 'FID' ? 'INP' : name];
  if (!info) return 'good';
  if (value <= info.thresholds.good) return 'good';
  if (value <= info.thresholds.poor) return 'needs-improvement';
  return 'poor';
}

function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return COLORS.success;
    case 'needs-improvement':
      return COLORS.warning;
    case 'poor':
      return COLORS.error;
    default:
      return COLORS.primary;
  }
}

function getRatingText(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '好';
    case 'needs-improvement':
      return '需要改进';
    case 'poor':
      return '差';
    default:
      return '未知';
  }
}

function formatMetricValue(name: string, value: number): string {
  const info = METRIC_INFO[name] ?? METRIC_INFO[name === 'FID' ? 'INP' : name];
  if (!info) return formatNumber(value);

  if (name === 'CLS') {
    return value.toFixed(3);
  }

  return `${formatNumber(Math.round(value))} ${info.unit}`;
}

export function useMetricInfo(): {
  metricInfo: Record<string, MetricInfoItem>;
  getRatingColor: (rating: 'good' | 'needs-improvement' | 'poor') => string;
  getRatingText: (rating: 'good' | 'needs-improvement' | 'poor') => string;
  formatMetricValue: (name: string, value: number) => string;
  getRatingFromValue: (name: string, value: number) => 'good' | 'needs-improvement' | 'poor';
} {
  return useMemo(
    () => ({
      metricInfo: METRIC_INFO,
      getRatingColor,
      getRatingText,
      formatMetricValue,
      getRatingFromValue,
    }),
    []
  );
}
