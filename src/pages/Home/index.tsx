import { useState, useEffect, useCallback, useRef } from 'react';
import { App, Image, Spin } from 'antd';
import { getBannerList } from './service';
import type { BannerItem } from '@/types';
import styles from './index.module.less';

function Home() {
  const { message } = App.useApp();
  const [bannerList, setBannerList] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inViewportIds, setInViewportIds] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const layoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLayoutWidthRef = useRef<number>(0);

  // 加载 Banner 列表（按 order 排序，order 越小越靠前）
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

  // 瀑布流布局计算（仅当容器宽度有效且与上次差异较大时重算，减少闪动）
  const layoutMasonry = useCallback(() => {
    if (!containerRef.current || bannerList.length === 0) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    if (containerWidth <= 0) return;
    // 宽度与上次相同或差异小于 2px 时跳过，避免 ResizeObserver 重复触发导致闪动
    if (Math.abs(containerWidth - lastLayoutWidthRef.current) < 2) return;
    lastLayoutWidthRef.current = containerWidth;

    const gap = 24; // 间距
    const columnCount = getColumnCount(containerWidth);
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
      item.style.width = `calc(${100 / columnCount}% - ${gap * (columnCount - 1) / columnCount}px)`;

      // 更新列高度（使用当前元素的实际高度）
      const itemHeight = item.offsetHeight || item.getBoundingClientRect().height || 300;
      columns[shortestColumnIndex] += itemHeight + gap;
    });

    // 设置容器高度
    const maxHeight = Math.max(...columns);
    if (maxHeight > 0) {
      container.style.height = `${maxHeight}px`;
    }
  }, [bannerList]);

  // 获取列数（基于容器宽度，避免侧栏折叠/展开时布局错位）
  const getColumnCount = (containerWidth?: number) => {
    if (typeof window === 'undefined') return 4;
    const width = containerWidth ?? containerRef.current?.offsetWidth ?? window.innerWidth;
    if (width < 576) return 1; // xs
    if (width < 768) return 2; // sm
    if (width < 1200) return 3; // md-lg
    return 4; // xl+
  };

  // 图片加载完成处理
  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // 防抖重新布局
    if (layoutTimerRef.current) {
      clearTimeout(layoutTimerRef.current);
    }
    layoutTimerRef.current = setTimeout(() => {
      layoutMasonry();
    }, 100);
  }, [layoutMasonry]);

  // 视口内懒加载：观察瀑布流卡片容器，进入视口后将 id 加入 inViewportIds，Image 再请求图片
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
      { rootMargin: '100px', threshold: 0.01 }
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
  }, [bannerList]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadBannerList();
  }, [loadBannerList]);

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
  }, [bannerList, layoutMasonry]);

  // 数据加载完成后布局
  useEffect(() => {
    if (!loading && bannerList.length > 0) {
      // 等待 DOM 更新后再布局
      requestAnimationFrame(() => {
        setTimeout(() => {
          layoutMasonry();
        }, 100);
      });
    }
  }, [loading, bannerList, layoutMasonry]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Image.PreviewGroup>
        <div ref={containerRef} className={styles.masonryContainer}>
          {bannerList.map((banner) => {
            const inViewport = inViewportIds.has(banner.id);
            const isLoaded = loadedImages.has(banner.id);
            return (
              <div
                key={banner.id}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(banner.id, el);
                  } else {
                    itemRefs.current.delete(banner.id);
                  }
                }}
                data-banner-id={banner.id}
                className={styles.masonryItem}
              >
                <div className={styles.imageWrapper}>
                  {!inViewport && (
                    <div className={styles.imagePlaceholder}>
                      <Spin size="small" />
                    </div>
                  )}
                  {inViewport && (
                    <Image
                      src={banner.bigImg}
                      alt={banner.title}
                      rootClassName={styles.bannerImageWrap}
                      className={`${styles.bannerImage} ${isLoaded ? styles.loaded : ''}`}
                      preview={{ mask: '点击查看' }}
                      onLoad={() => handleImageLoad(banner.id)}
                      onError={() => handleImageLoad(banner.id)}
                    />
                  )}
                  <div className={styles.textOverlay}>
                    <div className={styles.overlayContent}>
                      <h3 className={styles.cardTitle}>{banner.title}</h3>
                      <p className={styles.cardDescription}>{banner.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Image.PreviewGroup>
      {bannerList.length === 0 && !loading && (
        <div className={styles.emptyContainer}>
          <p>暂无数据</p>
        </div>
      )}
    </div>
  );
}

export default Home;
