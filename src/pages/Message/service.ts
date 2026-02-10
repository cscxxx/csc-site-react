/**
 * 留言板服务
 * GET /api/message 分页查询，POST /api/message 发布留言
 */

import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type { MessageItem, MessageListParams, MessageListData, PublishMessageParams } from './types';

/**
 * 获取留言列表
 * @param params page、limit、keyword、blogid
 */
export async function getMessageList(
  params: MessageListParams
): Promise<MessageListData> {
  const { promise } = request.get<ApiResponse<MessageListData>>('/api/message', {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.blogid != null ? { blogid: params.blogid } : {}),
    },
  });
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '获取留言列表失败');
  }
  if (body.data == null) {
    return { total: 0, rows: [] };
  }
  return body.data;
}

/**
 * 发布留言
 * @param params nickname、content
 */
export async function publishMessage(params: PublishMessageParams): Promise<MessageItem> {
  const { promise } = request.post<ApiResponse<MessageItem>>('/api/message', params);
  const res = await promise;
  const body = res.data;

  if (body.code !== 0) {
    throw new Error(body.msg || '发布失败');
  }
  if (body.data == null) {
    throw new Error(body.msg || '发布失败');
  }
  return body.data;
}
