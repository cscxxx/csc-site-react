/**
 * 设置服务
 * 对应接口 GET /api/setting，接口直接返回 SettingData 对象，无 code/data 包装
 */

import request from '@/utils/request';
import type { SettingData } from '@/types';

/**
 * 获取设置信息
 * @returns 设置数据
 */
export async function getSetting(): Promise<SettingData> {
  const { promise } = request.get<SettingData>('/api/setting');
  const res = await promise;
  const data = res.data;
  if (data == null || typeof data !== 'object') {
    throw new Error('获取设置失败');
  }
  return data as SettingData;
}
