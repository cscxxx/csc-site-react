/**
 * 博客文章服务
 * 仅展示用途：GET 列表、GET 单条
 */

import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type { BlogItem, BlogListParams, BlogListData } from './types.ts';

/**
 * 获取文章列表（分页、关键词、分类）
 */
export async function getBlogList(params: BlogListParams): Promise<BlogListData> {
  const { promise } = request.get<ApiResponse<BlogListData>>('/api/blog', {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.categoryid != null ? { categoryid: params.categoryid } : {}),
    },
  });
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '获取文章列表失败');
  }
  if (body.data == null) {
    return { total: 0, rows: [] };
  }
  return body.data;
}

/**
 * 获取单篇文章
 */
export async function getBlog(id: number): Promise<BlogItem> {
  const { promise } = request.get<ApiResponse<BlogItem>>(`/api/blog/${id}`);
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '获取文章失败');
  }
  if (body.data == null) {
    throw new Error('获取文章失败');
  }
  return body.data;
}
