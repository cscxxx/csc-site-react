/**
 * 路由配置
 *
 * 使用 React Router DOM v7 的 createBrowserRouter 创建路由
 *
 * 路由结构：
 * - 主路由：/ 下为 AppLayout，子路由为各页面
 * - 公开路由：*（404 页面）
 *
 * 路由特性：
 * - 使用 React.lazy 进行代码分割和懒加载
 * - 使用 LazyRoute 组件包装，提供加载状态和过渡动画
 * - 默认路由（/）重定向到 /dashboard
 *
 * @module router
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts';
import LazyRoute, { LoadingFallback } from '@/components/LazyRoute';

// 路由懒加载：使用 React.lazy 动态导入页面组件
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CursorGuide = lazy(() => import('@/pages/CursorGuide'));
const Performance = lazy(() => import('@/pages/Performance'));
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Message = lazy(() => import('@/pages/Message'));
const Project = lazy(() => import('@/pages/Project'));
const Blog = lazy(() => import('@/pages/Blog/index.tsx'));
const BlogDetailPage = lazy(() => import('@/pages/Blog/BlogDetailPage/index.tsx'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export const router = createBrowserRouter([
  // 主布局路由：所有页面均在 AppLayout 下
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'home',
        element: <LazyRoute component={Home} />,
      },
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'dashboard',
        element: <LazyRoute component={Dashboard} />,
      },
      {
        path: 'users',
        element: <Navigate to="/cursor-guide" replace />,
      },
      {
        path: 'cursor-guide',
        element: <LazyRoute component={CursorGuide} />,
      },
      {
        path: 'performance',
        element: <LazyRoute component={Performance} />,
      },

      {
        path: 'about',
        element: <LazyRoute component={About} />,
      },
      {
        path: 'message',
        element: <LazyRoute component={Message} />,
      },
      {
        path: 'project',
        element: <LazyRoute component={Project} />,
      },
      {
        path: 'blog',
        element: <LazyRoute component={Blog} />,
      },
      {
        path: 'blog/:id',
        element: <LazyRoute component={BlogDetailPage} />,
      },
    ],
  },
  // 公开路由：404 页面，无需登录验证
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
