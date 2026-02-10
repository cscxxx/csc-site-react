/**
 * 示例项目服务
 * 仅展示用途：GET 列表
 */

import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type { ProjectItem } from './types';

/**
 * 获取项目列表
 */
export async function getProjectList(): Promise<ProjectItem[]> {
  const { promise } = request.get<ApiResponse<ProjectItem[]>>('/api/project');
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '获取项目列表失败');
  }
  if (!Array.isArray(body.data)) {
    return [];
  }
  return body.data;
}
