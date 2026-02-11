/**
 * 性能监控页表格列配置
 */

import { useMemo } from 'react';
import { Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { PerfRecord } from '@/types';
import { useMetricInfo } from './use-metric-info.ts';

type MetricName = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB';

export function useColumns(): ColumnsType<PerfRecord> {
  const { getRatingColor, getRatingText, formatMetricValue, getRatingFromValue, metricInfo } =
    useMetricInfo();

  return useMemo(() => {
    /** 带问号提示的指标表头 */
    const renderMetricTitle = (name: MetricName) => {
      const info = metricInfo[name] ?? metricInfo[name === 'FID' ? 'INP' : name];
      const description = info?.description ?? '';
      return (
        <span className="inline-flex items-center gap-1">
          {name}
          <Tooltip title={description}>
            <QuestionCircleOutlined style={{ marginLeft: 2, color: 'rgba(0,0,0,0.45)' }} />
          </Tooltip>
        </span>
      );
    };

    const renderMetric = (name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB', value: number | null) => {
      if (value == null) return '-';
      const rating = getRatingFromValue(name, value);
      return (
        <Space>
          <span>{formatMetricValue(name, value)}</span>
          <span style={{ color: getRatingColor(rating), fontSize: 12 }}>{getRatingText(rating)}</span>
        </Space>
      );
    };

    /** 所有列统一：单行省略，hover 显示完整内容 */
    const cellEllipsis = { showTitle: true } as const;

    const columns: ColumnsType<PerfRecord> = [
      {
        title: '时间',
        dataIndex: 'createDate',
        key: 'createDate',
        width: 160,
        ellipsis: cellEllipsis,
        render: (createDate: string) =>
          createDate ? dayjs(Number(createDate)).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: '页面',
        dataIndex: 'pageUrl',
        key: 'pageUrl',
        width: 200,
        ellipsis: cellEllipsis,
      },
      {
        title: '访客',
        dataIndex: 'visitorId',
        key: 'visitorId',
        width: 140,
        ellipsis: cellEllipsis,
      },
      {
        title: '浏览器',
        dataIndex: 'browser',
        key: 'browser',
        width: 100,
        ellipsis: cellEllipsis,
      },
      {
        title: '系统',
        dataIndex: 'os',
        key: 'os',
        width: 100,
        ellipsis: cellEllipsis,
      },
      {
        title: '设备',
        dataIndex: 'device',
        key: 'device',
        width: 80,
        ellipsis: cellEllipsis,
      },
      {
        title: renderMetricTitle('LCP'),
        dataIndex: 'lcp',
        key: 'lcp',
        width: 120,
        ellipsis: cellEllipsis,
        render: (v: number | null) => renderMetric('LCP', v),
      },
      {
        title: renderMetricTitle('FID'),
        dataIndex: 'fid',
        key: 'fid',
        width: 120,
        ellipsis: cellEllipsis,
        render: (v: number | null) => renderMetric('FID', v),
      },
      {
        title: renderMetricTitle('CLS'),
        dataIndex: 'cls',
        key: 'cls',
        width: 100,
        ellipsis: cellEllipsis,
        render: (v: number | null) => renderMetric('CLS', v),
      },
      {
        title: renderMetricTitle('FCP'),
        dataIndex: 'fcp',
        key: 'fcp',
        width: 100,
        ellipsis: cellEllipsis,
        render: (v: number | null) => renderMetric('FCP', v),
      },
      {
        title: renderMetricTitle('TTFB'),
        dataIndex: 'ttfb',
        key: 'ttfb',
        width: 100,
        ellipsis: cellEllipsis,
        render: (v: number | null) => renderMetric('TTFB', v),
      },
      {
        title: '停留(秒)',
        dataIndex: 'duration',
        key: 'duration',
        width: 100,
        ellipsis: cellEllipsis,
        render: (v: number | null) =>
          v != null ? `${(v / 1000).toFixed(1)}` : '-',
      },
      {
        title: '导航',
        dataIndex: 'navigationType',
        key: 'navigationType',
        width: 80,
        ellipsis: cellEllipsis,
      },
    ];
    return columns;
  }, [getRatingColor, getRatingText, formatMetricValue, getRatingFromValue, metricInfo]);
}
