/**
 * 性能数据服务
 * GET /api/perf 拉取列表，POST /api/perf 上报（可选，上报主要由 vitals 内 sendBeacon 完成）
 */

import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type { PerfReportPayload, PerfListData } from '@/types';

/**
 * 列表查询参数
 * page、limit 必填。日期时间可仅传 startDate/endDate，或配合 startTime/endTime（HH:mm）精确到分钟。
 */
export interface PerfListParams {
  page: number;
  limit: number;
  /** 日期时间范围 - 开始日期，如 2025-02-10 */
  startDate?: string | number;
  /** 开始时间，如 08:00 */
  startTime?: string;
  /** 日期时间范围 - 结束日期 */
  endDate?: string | number;
  /** 结束时间，如 18:30 */
  endTime?: string;
  /** 访客 ID，模糊匹配 */
  visitorId?: string;
  /** 页面 URL，模糊匹配 */
  pageUrl?: string;
  /** 客户端 IP，模糊匹配 */
  ip?: string;
}

/**
 * 获取性能数据列表
 * @param params 分页必填，其余为可选筛选条件
 */
export async function getPerfList(params: PerfListParams): Promise<PerfListData> {
  const { page, limit, startDate, startTime, endDate, endTime, visitorId, pageUrl, ip } = params;
  const query: Record<string, string | number> = { page, limit };
  if (startDate !== undefined && startDate !== '') query.startDate = startDate;
  if (startTime?.trim()) query.startTime = startTime.trim();
  if (endDate !== undefined && endDate !== '') query.endDate = endDate;
  if (endTime?.trim()) query.endTime = endTime.trim();
  if (visitorId?.trim()) query.visitorId = visitorId.trim();
  if (pageUrl?.trim()) query.pageUrl = pageUrl.trim();
  if (ip?.trim()) query.ip = ip.trim();

  const { promise } = request.get<ApiResponse<PerfListData>>('/api/perf', {
    params: query,
  });
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '获取性能列表失败');
  }
  if (body.data == null) {
    return { total: 0, rows: [] };
  }
  return body.data;
}

/**
 * 上报一条性能数据（用于非 sendBeacon 场景或重试）
 * @param payload 上报请求体
 */
export async function submitPerf(payload: PerfReportPayload): Promise<unknown> {
  const { promise } = request.post<ApiResponse<unknown>>('/api/perf', payload);
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '上报失败');
  }
  return body.data;
}
