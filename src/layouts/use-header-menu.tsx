/**
 * 头部下拉菜单配置
 * 退出登录等
 */

import { useMemo } from 'react';
import type { MenuProps } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

export function useHeaderMenu(): MenuProps['items'] {
  return useMemo<MenuProps['items']>(
    () => [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      },
    ],
    []
  );
}
