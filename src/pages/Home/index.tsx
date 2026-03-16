import { useRef } from 'react';
import { Image, Spin } from 'antd';
import { useBannerList } from './use-banner-list';
import { useMasonryLayout } from './use-masonry-layout';
import { useBannerLazyLoad } from './use-banner-lazy-load';
import { useBannerImageLoadState } from './use-banner-image-load-state';
import styles from './index.module.less';

function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { bannerList, loading } = useBannerList();
  const { scheduleLayoutAfterImageLoad } = useMasonryLayout(bannerList, containerRef, itemRefs);
  const { inViewportIds } = useBannerLazyLoad(bannerList, itemRefs);
  const { loadedImages, handleImageLoad } = useBannerImageLoadState(scheduleLayoutAfterImageLoad);

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
