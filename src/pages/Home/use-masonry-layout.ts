import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { BannerItem } from '@/types';

/**
 * 瀑布流布局计算：
 * - 根据容器宽度与卡片高度计算 left/top/width
 * - 移动端单列时关闭瀑布流，回退为自然文档流
 * - 负责容器高度同步
 */
export function useMasonryLayout(
  bannerList: BannerItem[],
  containerRef: RefObject<HTMLDivElement | null>,
  itemRefs: RefObject<Map<number, HTMLDivElement>>,
) {
  const layoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLayoutWidthRef = useRef<number>(0);

  const getColumnCount = useCallback(
    (containerWidth?: number) => {
      if (typeof window === 'undefined') return 4;
      const width = containerWidth ?? containerRef.current?.offsetWidth ?? window.innerWidth;
      if (width < 576) return 1; // xs
      if (width < 768) return 2; // sm
      if (width < 1200) return 3; // md-lg
      return 4; // xl+
    },
    [containerRef],
  );

  const layoutMasonry = useCallback(() => {
    if (!containerRef.current || bannerList.length === 0) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    if (containerWidth <= 0) return;

    const columnCount = getColumnCount(containerWidth);

    // 移动端（单列）不使用绝对定位瀑布流，回退为自然文档流布局
    if (columnCount <= 1) {
      container.style.height = '';
      bannerList.forEach((banner) => {
        const item = itemRefs.current.get(banner.id);
        if (!item) return;
        item.style.left = '';
        item.style.top = '';
        item.style.width = '';
      });
      return;
    }

    // 宽度与上次相同或差异小于 2px 时跳过，避免 ResizeObserver 重复触发导致闪动
    if (Math.abs(containerWidth - lastLayoutWidthRef.current) < 2) return;
    lastLayoutWidthRef.current = containerWidth;

    const gap = 24; // 间距
    const columns: number[] = new Array(columnCount).fill(0);

    // 先设置所有元素的位置和宽度
    bannerList.forEach((banner) => {
      const item = itemRefs.current.get(banner.id);
      if (!item) return;

      // 找到最短的列
      const shortestColumnIndex = columns.indexOf(Math.min(...columns));

      // 设置位置和宽度
      const left = shortestColumnIndex * (100 / columnCount);
      item.style.left = `${left}%`;
      item.style.top = `${columns[shortestColumnIndex]}px`;
      item.style.width = `calc(${100 / columnCount}% - ${(gap * (columnCount - 1)) / columnCount}px)`;

      // 更新列高度（使用当前元素的实际高度）
      const itemHeight = item.offsetHeight || item.getBoundingClientRect().height || 300;
      columns[shortestColumnIndex] += itemHeight + gap;
    });

    // 设置容器高度
    const maxHeight = Math.max(...columns);
    if (maxHeight > 0) {
      container.style.height = `${maxHeight}px`;
    }
  }, [bannerList, containerRef, getColumnCount, itemRefs]);

  // 数据变化后首轮布局
  useEffect(() => {
    if (bannerList.length === 0) return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        layoutMasonry();
      }, 100);
    });
  }, [bannerList, layoutMasonry]);

  // 图片加载时触发布局的防抖函数
  const scheduleLayoutAfterImageLoad = useCallback(
    () => {
      if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
      layoutTimerRef.current = setTimeout(() => {
        layoutMasonry();
      }, 100);
    },
    [layoutMasonry],
  );

  // 容器尺寸变化时重新布局（防抖 + 宽度变化阈值，减少侧栏折叠/展开时的闪动）
  useEffect(() => {
    if (bannerList.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const RESIZE_DEBOUNCE_MS = 120;

    const scheduleLayout = () => {
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      resizeDebounceRef.current = setTimeout(() => {
        resizeDebounceRef.current = null;
        layoutMasonry();
      }, RESIZE_DEBOUNCE_MS);
    };

    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(container);

    const handleResize = () => scheduleLayout();
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [bannerList, containerRef, layoutMasonry]);

  return {
    scheduleLayoutAfterImageLoad,
  };
}

