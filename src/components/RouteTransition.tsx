import { useLocation } from 'react-router-dom';
import styles from './RouteTransition.module.less';

interface RouteTransitionProps {
  children: React.ReactNode;
}

/**
 * 路由过渡动画组件
 * 使用 CSS 动画实现淡入效果，避免首屏加载 GSAP
 */
function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();

  return (
    <div key={location.pathname} className={styles.routeTransition}>
      {children}
    </div>
  );
}

export default RouteTransition;
