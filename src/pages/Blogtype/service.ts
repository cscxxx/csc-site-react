/**
 * 文章分类服务
 * 仅展示用途：GET 列表
 */

import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type { BlogtypeItem } from './types';

/**
 * 获取所有分类
 */
export async function getBlogtypeList(): Promise<BlogtypeItem[]> {
  const { promise } = request.get<ApiResponse<BlogtypeItem[]>>('/api/blogtype');
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '获取分类列表失败');
  }
  if (!Array.isArray(body.data)) {
    return [];
  }
  return body.data;
}
