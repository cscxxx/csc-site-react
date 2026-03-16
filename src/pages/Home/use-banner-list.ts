import { useCallback, useEffect, useState } from 'react';
import { App } from 'antd';
import { getBannerList } from './service';
import type { BannerItem } from '@/types';

/**
 * 加载并管理 Banner 列表数据
 * - 负责请求、排序、错误提示和 loading 状态
 */
export function useBannerList() {
  const { message } = App.useApp();
  const [bannerList, setBannerList] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBannerList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBannerList();
      const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBannerList(sorted);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取 Banner 列表失败';
      message.error(errorMessage);
      console.error('Failed to load banner list:', error);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadBannerList();
  }, [loadBannerList]);

  return {
    bannerList,
    loading,
  };
}

