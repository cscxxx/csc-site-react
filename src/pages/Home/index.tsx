import { useState, useEffect, useCallback, useRef } from 'react';
import { App, Spin } from 'antd';
import { getBannerList } from './service';
import type { BannerItem } from '@/types';
import styles from './index.module.less';

function Home() {
  const { message } = App.useApp();
  const [bannerList, setBannerList] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const imageRefs = useRef<Map<number, HTMLImageElement>>(new Map());
  const layoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载 Banner 列表
  const loadBannerList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBannerList();
      setBannerList(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取 Banner 列表失败';
      message.error(errorMessage);
      console.error('Failed to load banner list:', error);
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 瀑布流布局计算
  const layoutMasonry = useCallback(() => {
    if (!containerRef.current || bannerList.length === 0) return;

    const container = containerRef.current;
    const gap = 24; // 间距
    const columnCount = getColumnCount();
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

  // 获取列数
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
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

  // 初始化 Intersection Observer 用于懒加载
  useEffect(() => {
    if (bannerList.length === 0) return;

    // 创建 observer（只创建一次）
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const id = parseInt(img.dataset.id || '0', 10);
              
              if (!loadedImages.has(id) && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
            }
          });
        },
        {
          rootMargin: '50px', // 提前 50px 开始加载
        }
      );
    }

    // 观察所有未加载的图片
    const timer = setTimeout(() => {
      imageRefs.current.forEach((img) => {
        if (img && observerRef.current && img.dataset.src && !loadedImages.has(parseInt(img.dataset.id || '0', 10))) {
          observerRef.current.observe(img);
        }
      });
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [bannerList, loadedImages]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadBannerList();
  }, [loadBannerList]);

  // 窗口大小改变时重新布局
  useEffect(() => {
    if (bannerList.length === 0) return;
    
    const handleResize = () => {
      layoutMasonry();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      <div ref={containerRef} className={styles.masonryContainer}>
        {bannerList.map((banner) => {
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
              className={styles.masonryItem}
            >
              <div className={styles.imageWrapper}>
                {!isLoaded && (
                  <div className={styles.imagePlaceholder}>
                    <Spin size="small" />
                  </div>
                )}
                <img
                  ref={(el) => {
                    if (el) {
                      imageRefs.current.set(banner.id, el);
                      // 如果 observer 已创建，立即观察
                      if (observerRef.current && el.dataset.src && !isLoaded) {
                        observerRef.current.observe(el);
                      }
                    } else {
                      const img = imageRefs.current.get(banner.id);
                      if (img && observerRef.current) {
                        observerRef.current.unobserve(img);
                      }
                      imageRefs.current.delete(banner.id);
                    }
                  }}
                  data-id={banner.id}
                  data-src={banner.bigImg}
                  alt={banner.title}
                  className={`${styles.bannerImage} ${isLoaded ? styles.loaded : ''}`}
                  onLoad={() => handleImageLoad(banner.id)}
                  onError={() => handleImageLoad(banner.id)}
                />
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
      {bannerList.length === 0 && !loading && (
        <div className={styles.emptyContainer}>
          <p>暂无数据</p>
        </div>
      )}
    </div>
  );
}

export default Home;
