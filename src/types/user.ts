/**
 * 用户相关类型定义
 */

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户 ID */
  id: number;
  /** 登录 ID */
  loginId: string;
  /** 用户名称 */
  name: string;
  /** 邮箱 */
  email?: string;
  /** 头像 URL */
  avatar?: string;
  /** 角色 */
  role?: string;
  /** 状态 */
  status?: string;
}

/**
 * 用户列表项（用于表格展示）
 */
export interface UserListItem extends UserInfo {
  /** 表格行 key */
  key: string;
}
