/**
 * 示例项目相关类型
 */

/** 列表项（接口返回的 description 可能为 string[] 或 JSON 字符串） */
export interface ProjectItem {
  id: number;
  name: string;
  url: string;
  github: string;
  description: string[] | string;
  thumb: string;
  order: number;
}
