/**
 * 关于页面服务
 * GET /api/about 获取关于链接
 */

import request from '@/utils/request';
import type { ApiResponse } from '@/types';

/**
 * 获取关于页面链接
 * @returns 关于页面的 URL 字符串
 */
export async function getAbout(): Promise<string> {
  const { promise } = request.get<ApiResponse<string>>('/api/about');
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '获取关于信息失败');
  }
  if (body.data == null) {
    return '';
  }
  return body.data;
}
