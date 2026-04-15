import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button, Drawer } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  DollarOutlined,
  BellOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { RootState } from '../store';
import { logout, setUser } from '../store';
import { authService, alertService } from '../services/api';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.alerts);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authService.getMe();
          dispatch(setUser({ user: response.data.user, token }));
        }
      } catch (error) {
        dispatch(logout());
        navigate('/login');
      }
    };
    fetchUser();
  }, [dispatch, navigate]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await alertService.getUnreadCount();
        if (response.data.success) {
          dispatch({ type: 'alerts/setUnreadCount', payload: response.data.count });
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    fetchUnreadCount();
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Produits',
    },
    {
      key: '/markets',
      icon: <ShopOutlined />,
      label: 'Marchés',
    },
    {
      key: '/prices',
      icon: <DollarOutlined />,
      label: 'Prix',
    },
    {
      key: '/alerts',
      icon: <Badge count={unreadCount} size="small">
        <BellOutlined />
      </Badge>,
      label: 'Alertes',
    },
    ...(user?.role === 'admin' ? [{
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Utilisateurs',
    }] : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="app-layout">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
          width={240}
          className={collapsed ? 'ant-layout-sider-collapsed' : ''}
        >
          <div className="logo" style={{ padding: '16px', color: '#fff', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            {!collapsed && (
              <>
                <span className="logo-green">Sén</span>
                <span className="logo-yellow">Prix</span>
              </>
            )}
            {collapsed && <span className="logo-red">SP</span>}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
      )}

      {isMobile && (
        <Drawer
          title={
            <div className="logo" style={{ justifyContent: 'center' }}>
              <span className="logo-green">Sén</span>
              <span className="logo-yellow">Prix</span>
            </div>
          }
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          width={250}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Drawer>
      )}

      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              style={{ fontSize: '16px' }}
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
          )}
          <Space>
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => navigate('/alerts')}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#00853F' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
                {!isMobile && <Text>{user?.firstName} {user?.lastName}</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: isMobile ? '8px' : '16px', padding: isMobile ? '12px' : '24px', background: '#fff', borderRadius: '8px', minHeight: 'calc(100vh - 64px - 32px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
