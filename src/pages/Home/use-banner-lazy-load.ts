import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { BannerItem } from '@/types';

/**
 * 卡片懒加载：
 * - 使用 IntersectionObserver 监听卡片是否进入视口
 * - 仅在进入视口后才真正加载图片
 */
export function useBannerLazyLoad(
  bannerList: BannerItem[],
  itemRefs: RefObject<Map<number, HTMLDivElement>>,
) {
  const [inViewportIds, setInViewportIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (bannerList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const id = parseInt(el.getAttribute('data-banner-id') ?? '0', 10);
          setInViewportIds((prev) => {
            if (prev.has(id)) return prev;
            return new Set(prev).add(id);
          });
          observer.unobserve(el);
        });
      },
      { rootMargin: '100px', threshold: 0.01 },
    );

    const timer = setTimeout(() => {
      bannerList.forEach((banner) => {
        const itemEl = itemRefs.current.get(banner.id);
        if (itemEl) observer.observe(itemEl);
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [bannerList, itemRefs]);

  return {
    inViewportIds,
  };
}

