import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Popover } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { useSettingStore } from '@/store';
import { getSetting } from '@/services/setting';
import { useSideMenu } from './use-side-menu.tsx';
import styles from './index.module.less';

const { Sider, Content } = Layout;

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const setting = useSettingStore(state => state.setting);
  const setSetting = useSettingStore(state => state.setSetting);

  // 每次页面加载时拉取设置并写入 store
  const { run: fetchSetting } = useRequest(getSetting, {
    manual: true,
    onSuccess: data => {
      setSetting(data);
      // 设置 favicon
      if (data.favicon) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (link) {
          link.href = data.favicon;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = data.favicon;
          document.head.appendChild(newLink);
        }
      }
    },
    onError: err => {
      console.error('获取设置失败:', err);
    },
  });
  useEffect(() => {
    // 每次组件挂载或页面重新加载时都重新获取设置
    fetchSetting();
  }, [fetchSetting]);

  const menuItems = useSideMenu();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const selectedKeys = [location.pathname];

  const [userOpenKeys, setUserOpenKeys] = useState<string[]>([]);
  const openKeys = userOpenKeys;
  const [collapsed, setCollapsed] = useState(true);

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
          {setting && (
            <div className={styles.settingBlock}>
              {!collapsed ? (
                <>
                  <div className={styles.settingProfile}>
                    {setting.avatar ? (
                      <img src={setting.avatar} alt="" className={styles.settingAvatar} />
                    ) : null}
                    <span className={styles.settingSiteTitle}>{setting.siteTitle}</span>
                  </div>
                  <div className={styles.settingContact}>
                    {setting.qq ? (
                      <Popover
                        trigger="hover"
                        content={
                          setting.qqQrCode ? (
                            <img src={setting.qqQrCode} alt="QQ" className={styles.settingQrImg} />
                          ) : (
                            setting.qq
                          )
                        }
                      >
                        <span className={styles.settingContactItem}>QQ</span>
                      </Popover>
                    ) : null}
                    {setting.weixin ? (
                      <Popover
                        trigger="hover"
                        content={
                          setting.weixinQrCode ? (
                            <img
                              src={setting.weixinQrCode}
                              alt="微信"
                              className={styles.settingQrImg}
                            />
                          ) : (
                            setting.weixin
                          )
                        }
                      >
                        <span className={styles.settingContactItem}>微信</span>
                      </Popover>
                    ) : null}
                    {setting.github ? (
                      <a
                        href={setting.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.settingContactLink}
                      >
                        {setting.githubName || 'GitHub'}
                      </a>
                    ) : null}
                    {setting.mail ? (
                      <a href={`mailto:${setting.mail}`} className={styles.settingContactLink}>
                        邮箱
                      </a>
                    ) : null}
                  </div>
                </>
              ) : (
                <Popover
                  trigger="hover"
                  placement="right"
                  content={
                    <div className={styles.settingPopoverContent}>
                      {setting.avatar ? (
                        <img src={setting.avatar} alt="" className={styles.settingQrImg} />
                      ) : null}
                      <div>{setting.siteTitle}</div>
                      {setting.qq && (
                        <Popover
                          trigger="hover"
                          content={
                            setting.qqQrCode ? (
                              <img
                                src={setting.qqQrCode}
                                alt="QQ"
                                className={styles.settingQrImg}
                              />
                            ) : (
                              setting.qq
                            )
                          }
                        >
                          <span className={styles.settingContactItem}>QQ</span>
                        </Popover>
                      )}
                      {setting.weixin && (
                        <Popover
                          trigger="hover"
                          content={
                            setting.weixinQrCode ? (
                              <img
                                src={setting.weixinQrCode}
                                alt="微信"
                                className={styles.settingQrImg}
                              />
                            ) : (
                              setting.weixin
                            )
                          }
                        >
                          <span className={styles.settingContactItem}>微信</span>
                        </Popover>
                      )}
                    </div>
                  }
                >
                  <div className={styles.settingCollapsed}>
                    {setting.avatar ? (
                      <img src={setting.avatar} alt="" className={styles.settingAvatarSmall} />
                    ) : (
                      <span className={styles.settingAvatarPlaceholder}>?</span>
                    )}
                  </div>
                </Popover>
              )}
            </div>
          )}
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
