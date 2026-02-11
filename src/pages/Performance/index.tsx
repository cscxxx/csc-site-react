import { useState, useCallback } from 'react';
import { Card, Button, Space, Table, Form, Input, DatePicker } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { getPerfList } from './service';
import type { PerfListParams } from './service';
import type { PerfRecord } from '@/types';
import { useColumns } from './use-columns.tsx';
import styles from './index.module.less';

const DEFAULT_PAGE_SIZE = 20;
const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';
const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

/** 查询表单值 */
interface PerfFilterForm {
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  visitorId?: string;
  pageUrl?: string;
  ip?: string;
}

function Performance() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [form] = Form.useForm<PerfFilterForm>();
  /** 当前生效的查询条件（用于请求与 refreshDeps） */
  const [filters, setFilters] = useState<Omit<PerfListParams, 'page' | 'limit'>>({});
  const columns = useColumns();

  const buildParams = useCallback((): PerfListParams => {
    const base = { page, limit: pageSize };
    if (Object.keys(filters).length === 0) return base;
    return { ...base, ...filters };
  }, [page, pageSize, filters]);

  const {
    data: listData,
    loading,
    run: runFetchList,
  } = useRequest(() => getPerfList(buildParams()), { refreshDeps: [buildParams] });

  const onSearch = useCallback(() => {
    const values = form.getFieldsValue() as PerfFilterForm;
    const next: Omit<PerfListParams, 'page' | 'limit'> = {};
    if (values.dateRange?.length === 2) {
      next.startDate = values.dateRange[0].format(DATE_FORMAT);
      next.startTime = values.dateRange[0].format(TIME_FORMAT);
      next.endDate = values.dateRange[1].format(DATE_FORMAT);
      next.endTime = values.dateRange[1].format(TIME_FORMAT);
    }
    if (values.visitorId?.trim()) next.visitorId = values.visitorId.trim();
    if (values.pageUrl?.trim()) next.pageUrl = values.pageUrl.trim();
    if (values.ip?.trim()) next.ip = values.ip.trim();
    setFilters(next);
    setPage(1);
  }, [form]);

  const onReset = useCallback(() => {
    form.resetFields();
    setFilters({});
    setPage(1);
  }, [form]);

  const rows = listData?.rows ?? [];
  const total = listData?.total ?? 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>性能监控</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => runFetchList()} loading={loading}>
            刷新列表
          </Button>
        </Space>
      </div>

      <Card title="查询条件" size="small" className={styles.filterCard}>
        <Form form={form} layout="inline" onFinish={onSearch} style={{ flexWrap: 'wrap', gap: 8 }}>
          <Form.Item name="dateRange" label="日期时间范围">
            <DatePicker.RangePicker
              allowClear
              showTime={{ format: TIME_FORMAT }}
              format={DATETIME_FORMAT}
              style={{ width: 360 }}
            />
          </Form.Item>
          <Form.Item name="visitorId" label="访客 ID">
            <Input placeholder="模糊匹配" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="pageUrl" label="页面 URL">
            <Input placeholder="模糊匹配" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="ip" label="IP">
            <Input placeholder="模糊匹配" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={onReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="上报记录">
        <Table<PerfRecord>
          size="small"
          columns={columns}
          dataSource={rows}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: t => `共 ${t} 条`,
            onChange: (p, size) => {
              setPage(p);
              setPageSize(size ?? DEFAULT_PAGE_SIZE);
            },
          }}
          locale={{ emptyText: '暂无上报记录' }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
}

export default Performance;
