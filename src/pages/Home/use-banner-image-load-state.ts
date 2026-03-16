import { useCallback, useState } from 'react';

/**
 * 图片加载状态管理：
 * - 记录已完成加载的图片 id
 * - 在图片加载/失败后触发布局重算
 */
export function useBannerImageLoadState(
  scheduleLayoutAfterImageLoad: () => void,
) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback(
    (id: number) => {
      setLoadedImages((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      scheduleLayoutAfterImageLoad();
    },
    [scheduleLayoutAfterImageLoad],
  );

  return {
    loadedImages,
    handleImageLoad,
  };
}

