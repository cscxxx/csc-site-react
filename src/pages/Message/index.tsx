import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Space, App, Pagination, Spin } from 'antd';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { getMessageList, publishMessage } from './service';
import type { MessageItem, MessageListParams } from './types';
import styles from './index.module.less';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
/** 超过该字数时折叠，点击展开 */
const CONTENT_COLLAPSE_THRESHOLD = 80;

function Message() {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ nickname: string; content: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const keyword = searchParams.get('keyword') ?? '';
  const blogid = searchParams.get('blogid') ? Number(searchParams.get('blogid')) : undefined;
  const [keywordInput, setKeywordInput] = useState(keyword);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const listParams: MessageListParams = { page, limit };
  if (keyword.trim()) listParams.keyword = keyword.trim();
  if (blogid != null) listParams.blogid = blogid;

  const { data: listData, loading, run: runFetchList } = useRequest(
    () => getMessageList(listParams),
    {
      refreshDeps: [page, limit, keyword, blogid],
    }
  );

  const { run: runPublish, loading: publishLoading } = useRequest(
    (values: { nickname: string; content: string }) => publishMessage(values),
    {
      manual: true,
      onSuccess: () => {
        message.success('发布成功');
        form.resetFields();
        runFetchList();
      },
      onError: err => {
        message.error(err instanceof Error ? err.message : '发布失败');
      },
    }
  );

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        const s = String(v);
        if (
          s === '' ||
          (k === 'page' && s === '1') ||
          (k === 'limit' && s === String(DEFAULT_LIMIT))
        ) {
          if (k === 'keyword') next.delete(k);
          else if (k === 'page') next.set(k, '1');
          else if (k === 'limit') next.set(k, String(DEFAULT_LIMIT));
        } else {
          next.set(k, s);
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = () => {
    setParams({ keyword: keywordInput.trim(), page: 1 });
  };

  const handlePageChange = (nextPage: number, nextPageSize?: number) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.set('page', String(nextPage));
        if (nextPageSize != null) next.set('limit', String(nextPageSize));
        return next;
      },
      { replace: true }
    );
  };

  const list = listData?.rows ?? [];
  const total = listData?.total ?? 0;

  const formatDate = (createDate: string) =>
    dayjs(Number(createDate)).format('YYYY-MM-DD HH:mm:ss');

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>留言板</h1>

      <div className={styles.mainLayout}>
        <div className={styles.listSection}>
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

        <Spin spinning={loading}>
          <ul className={styles.messageList}>
            {list.map((item: MessageItem) => (
              <li key={item.id} className={styles.messageItem}>
                <div className={styles.messageAvatar}>
                  {item.avatar ? (
                    <img src={item.avatar} alt="" />
                  ) : (
                    <span className={styles.avatarPlaceholder} />
                  )}
                </div>
                <div className={styles.messageBody}>
                  <div className={styles.messageMeta}>
                    <span className={styles.nickname}>{item.nickname}</span>
                    <span className={styles.createDate}>{formatDate(item.createDate)}</span>
                  </div>
                  <div className={styles.messageContent}>
                    {item.content.length <= CONTENT_COLLAPSE_THRESHOLD ? (
                      item.content
                    ) : expandedIds.has(item.id) ? (
                      <>
                        {item.content}
                        <Button
                          type="link"
                          size="small"
                          className={styles.expandBtn}
                          icon={<UpOutlined />}
                          onClick={() => toggleExpand(item.id)}
                        >
                          收起
                        </Button>
                      </>
                    ) : (
                      <>
                        {item.content.slice(0, CONTENT_COLLAPSE_THRESHOLD)}...
                        <Button
                          type="link"
                          size="small"
                          className={styles.expandBtn}
                          icon={<DownOutlined />}
                          onClick={() => toggleExpand(item.id)}
                        >
                          展开
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {total > 0 && (
            <div className={styles.paginationWrap}>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger
                showTotal={t => `共 ${t} 条`}
                pageSizeOptions={[10, 20, 50]}
                onChange={handlePageChange}
              />
            </div>
          )}
        </Spin>
        </div>

        <div className={styles.publishSection}>
          <Form
            form={form}
            layout="vertical"
            onFinish={values => runPublish(values)}
            className={styles.publishForm}
          >
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input placeholder="请输入昵称" maxLength={50} showCount />
            </Form.Item>
            <Form.Item
              name="content"
              label="留言内容"
              rules={[{ required: true, message: '请输入留言内容' }]}
            >
              <Input.TextArea placeholder="请输入留言内容" rows={4} maxLength={500} showCount />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={publishLoading}>
                发布留言
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Message;
