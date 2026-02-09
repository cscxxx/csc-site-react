import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input, Button, Space, List, Row, Col, App, Image, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getBlogList } from './service';
import { getBlogtypeList } from '@/pages/Blogtype/service';
import type { BlogItem, BlogListParams } from './types.ts';
import type { BlogtypeItem } from '@/pages/Blogtype/types';
import styles from './index.module.less';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function Blog() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const keyword = searchParams.get('keyword') ?? '';
  const categoryidParam = searchParams.get('categoryid');
  const categoryid = categoryidParam ? Number(categoryidParam) : undefined;

  const [list, setList] = useState<BlogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BlogtypeItem[]>([]);
  const [keywordInput, setKeywordInput] = useState(keyword);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const params: BlogListParams = { page, limit };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (categoryid != null) params.categoryid = categoryid;
      const data = await getBlogList(params);
      setList(data.rows);
      setTotal(data.total);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取文章列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, limit, keyword, categoryid, message]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getBlogtypeList();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  const setParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === '') {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = () => {
    setParams({ keyword: keywordInput.trim(), page: 1 });
  };

  const handleCategoryChange = (value: number | undefined) => {
    setParams({ categoryid: value, page: 1 });
  };

  const handleView = (record: BlogItem) => {
    navigate(`/blog/${record.id}`);
  };

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.set('page', String(newPage));
        next.set('limit', String(newPageSize));
        return next;
      },
      { replace: true }
    );
  };

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

  return (
    <div className={styles.pageContainer}>
      <Row gutter={24}>
        {/* 左侧：文章列表区域 */}
        <Col flex={1} className={styles.articleListCol}>
          <div className={styles.toolbar}>
            <Space wrap>
              <Input
                className={styles.searchInput}
                placeholder="关键词搜索"
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
            </Space>
          </div>
          <List<BlogItem>
            className={styles.articleList}
            loading={loading}
            dataSource={list}
            renderItem={(item) => (
              <List.Item
                className={styles.articleItem}
                onClick={() => handleView(item)}
              >
                <div className={styles.articleContent}>
                  {item.thumb && (
                    <div className={styles.articleThumb}>
                      <Image
                        src={item.thumb}
                        alt={item.title}
                        preview={false}
                        width={120}
                        height={80}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className={styles.articleInfo}>
                    <h3 className={styles.articleTitle}>{item.title}</h3>
                    <p className={styles.articleDescription}>{item.description}</p>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleCategory}>
                        {categoryMap.get(item.categoryId) || '未分类'}
                      </span>
                      <span className={styles.articleDate}>
                        {formatDate(item.createDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {total > 0 && (
            <div className={styles.pagination}>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger
                showTotal={(t) => `共 ${t} 条`}
                pageSizeOptions={['10', '20', '50']}
                onChange={handlePaginationChange}
                onShowSizeChange={handlePaginationChange}
              />
            </div>
          )}
        </Col>

        {/* 右侧：分类侧边栏 */}
        <Col className={styles.categorySidebarCol}>
          <div className={styles.categorySidebar}>
            <h3 className={styles.categoryTitle}>文章分类</h3>
            <div className={styles.categoryList}>
              <div
                className={`${styles.categoryItem} ${categoryid === undefined ? styles.active : ''}`}
                onClick={() => handleCategoryChange(undefined)}
              >
                全部
              </div>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`${styles.categoryItem} ${categoryid === category.id ? styles.active : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Blog;
