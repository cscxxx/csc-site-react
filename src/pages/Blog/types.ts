/**
 * 博客文章相关类型
 */

/** 文章项（列表/详情，createDate 仅展示用） */
export interface BlogItem {
  id: number;
  title: string;
  description: string;
  createDate: number;
  categoryId: number;
  toc?: unknown[];
  htmlContent?: string;
  thumb: string;
}

/** 列表查询参数（地址栏） */
export interface BlogListParams {
  page: number;
  limit: number;
  keyword?: string;
  categoryid?: number;
}

/** 列表接口返回的 data 结构 */
export interface BlogListData {
  total: number;
  rows: BlogItem[];
}
