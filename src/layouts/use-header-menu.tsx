/**
 * 头部下拉菜单配置
 * 设置、退出登录
 */

import { useMemo } from 'react';
import type { MenuProps } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';

export function useHeaderMenu(): MenuProps['items'] {
  return useMemo<MenuProps['items']>(
    () => [
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '设置',
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      },
    ],
    []
  );
}
