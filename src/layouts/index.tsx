import { useRef, useState } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useSettingStore } from '@/store';
import { useTitleAnimation } from './use-anime';
import { useSideMenu } from './use-side-menu.tsx';
import styles from './index.module.less';

const { Sider, Content } = Layout;

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const clearSetting = useSettingStore(state => state.clearSetting);
  const setting = useSettingStore(state => state.setting);
  const { token } = theme.useToken();

  const cscRef = useRef<HTMLSpanElement>(null);
  const siteRef = useRef<HTMLSpanElement>(null);

  // 标题两词使用主题色（浅色字 + 主色浅底）
  const titleColors = [token.colorTextLightSolid, token.colorPrimaryBg];

  useTitleAnimation([cscRef, siteRef], titleColors, {
    duration: 0.6,
    jumpHeight: -15,
    delay: 0.15,
  });

  const menuItems = useSideMenu();

  const handleMenuClick = ({ key }: { key: string }) => {
    // 处理退出登录
    if (key === 'logout') {
      handleLogout();
      return;
    }
    // 仅对带路径的菜单项导航
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const handleLogout = () => {
    logout();
    clearSetting();
    navigate('/login', { replace: true });
  };

  const selectedKeys = [location.pathname];

  const [userOpenKeys, setUserOpenKeys] = useState<string[]>([]);
  const openKeys = userOpenKeys;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.layout}>
      <Sider
        width={200}
        collapsed={collapsed}
        collapsedWidth={64}
        collapsible
        trigger={null}
        className={styles.sider}
        style={{
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className={styles.siderInner}>
          <div className={styles.siderTitle}>
            <div className={styles.titleContent}>
              {!collapsed ? (
                <>
                  <span ref={cscRef} className={styles.titleWord}>
                    CSC
                  </span>
                  <span className={styles.titleSpace}> </span>
                  <span ref={siteRef} className={styles.titleWord}>
                    Site
                  </span>
                </>
              ) : (
                <span className={styles.titleIcon}>C</span>
              )}
            </div>
          </div>
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setUserOpenKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className={styles.menu}
          />
          <div className={styles.siderFooter}>
            {!collapsed && (
              <div className={styles.footer}>{setting?.icp ?? 'Footer © 2026 CSC Site'}</div>
            )}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={`${styles.collapseBtn} ${collapsed ? styles.collapsed : ''}`}
            >
              {!collapsed && <span className={styles.collapseBtnText}>折叠</span>}
            </Button>
          </div>
        </div>
      </Sider>
      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}

export default AppLayout;
