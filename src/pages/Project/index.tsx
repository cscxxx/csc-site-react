import { useState, useEffect, useCallback, useMemo } from 'react';
import { App, Card, Empty, Image, Spin } from 'antd';
import { GithubOutlined, LinkOutlined } from '@ant-design/icons';
import { getProjectList } from './service';
import type { ProjectItem } from './types';

function parseDescription(description: ProjectItem['description']): string[] {
  if (Array.isArray(description)) return description;
  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description) as unknown;
      return Array.isArray(parsed) ? (parsed as string[]) : [description];
    } catch {
      return [description];
    }
  }
  return [];
}

function getTargetUrl(item: ProjectItem): string {
  if (item.url) return item.url;
  if (item.github) return item.github;
  return '';
}

function Project() {
  const { message } = App.useApp();
  const [list, setList] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjectList();
      setList(data);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取列表失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [list]);

  const openProject = (item: ProjectItem) => {
    const targetUrl = getTargetUrl(item);
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4">
      <h1 className="mb-3 text-xl font-bold">示例项目</h1>

      {loading ? (
        <div className="flex w-full justify-center py-10">
          <Spin />
        </div>
      ) : sortedList.length === 0 ? (
        <Empty description="暂无项目" />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedList.map(item => {
            const descList = parseDescription(item.description);
            const targetUrl = getTargetUrl(item);
            const disabled = !targetUrl;

            return (
              <Card
                key={item.id}
                hoverable={!disabled}
                className={disabled ? 'opacity-60' : ''}
                size="small"
                styles={{ body: { padding: 20 } }}
                onClick={() => openProject(item)}
                onKeyDown={e => {
                  if (disabled) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openProject(item);
                  }
                }}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-disabled={disabled}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {item.thumb ? (
                    <Image
                      src={item.thumb}
                      alt={item.name}
                      preview={false}
                      width={64}
                      height={72}
                      style={{ objectFit: 'cover', borderRadius: 6 }}
                    />
                  ) : (
                    <div className="h-[72px] w-16 shrink-0 rounded-md bg-neutral-100" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium">{item.name}</div>
                      <div className="shrink-0 text-xs text-neutral-400">#{item.id}</div>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-neutral-600">
                      {descList.length ? descList.join('；') : '暂无描述'}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="flex flex-col items-end gap-1 text-xs">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <LinkOutlined />
                          访问
                        </a>
                      ) : null}
                      {item.github ? (
                        <a
                          href={item.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-neutral-700 hover:underline"
                        >
                          <GithubOutlined />
                          GitHub
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Project;
