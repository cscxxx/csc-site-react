/**
 * Home 页面服务函数
 * 处理首页 Banner 相关的 API 请求
 */

import request from '@/utils/request';
import type { ApiResponse, BannerItem } from '@/types';

/**
 * 获取 Banner 列表（用于首页展示，含 order）
 * @returns Banner 列表数据
 */
export async function getBannerList(): Promise<BannerItem[]> {
  const { promise } = request.get<ApiResponse<BannerItem[]>>('/api/banner');
  const response = await promise;

  if (response.data.code === 0 && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.msg || '获取 Banner 列表失败');
}

/**
 * 获取全部 Banner（用于管理端，含 order）
 * @returns Banner 列表数据
 */
export async function getBannerAll(): Promise<BannerItem[]> {
  const { promise } = request.get<ApiResponse<BannerItem[]>>('/api/bannerAll');
  const response = await promise;

  if (response.data.code === 0 && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.msg || '获取 Banner 列表失败');
}
