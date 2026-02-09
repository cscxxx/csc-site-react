import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, App, Image, Spin, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import 'github-markdown-css/github-markdown-light.css';
import { getBlog } from '../service';
import { getBlogtypeList } from '@/pages/Blogtype/service';
import type { BlogItem } from '../types';
import type { BlogtypeItem } from '@/pages/Blogtype/types';
import styles from './index.module.less';

function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [categories, setCategories] = useState<BlogtypeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBlog = useCallback(async () => {
    if (!id) {
      message.error('文章 ID 不存在');
      navigate('/blog');
      return;
    }

    try {
      setLoading(true);
      const data = await getBlog(Number(id));
      setBlog(data);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取文章失败');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  }, [id, message, navigate]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getBlogtypeList();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    loadBlog();
    loadCategories();
  }, [loadBlog, loadCategories]);

  const formatDate = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return '未知日期';
    }
    // 如果时间戳是秒级，转换为毫秒级
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const date = new Date(timestampMs);
    if (isNaN(date.getTime())) {
      return '未知日期';
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未分类';
  };

  const handleBack = () => {
    navigate('/blog');
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.pageContainer}>
        <Empty description="文章不存在" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className={styles.backButton}
      >
        返回
      </Button>
      <Card className={styles.blogCard}>
        <div className={styles.blogHeader}>
          <h1 className={styles.blogTitle}>{blog.title}</h1>
          <div className={styles.blogMeta}>
            <span className={styles.blogCategory}>{getCategoryName(blog.categoryId)}</span>
            <span className={styles.blogDate}>{formatDate(blog.createDate)}</span>
          </div>
        </div>
        {blog.thumb && (
          <div className={styles.blogThumb}>
            <Image
              src={blog.thumb}
              alt={blog.title}
              preview={false}
            />
          </div>
        )}
        {blog.description && (
          <div className={styles.blogDescription}>{blog.description}</div>
        )}
        {blog.htmlContent && (
          <div
            className={`markdown-body ${styles.blogContent}`}
            dangerouslySetInnerHTML={{ __html: blog.htmlContent }}
          />
        )}
      </Card>
    </div>
  );
}

export default BlogDetailPage;
