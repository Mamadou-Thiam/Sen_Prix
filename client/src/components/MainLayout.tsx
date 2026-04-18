import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button, Drawer } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  BellOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FlagOutlined,
  WarningOutlined,
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
    if (!user) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleLogout, 60000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, dispatch, navigate]);

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
    ...(user?.role === 'admin' ? [{
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    }] : []),
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
    ...(user?.role !== 'admin' ? [{
      key: '/report-price',
      icon: <WarningOutlined />,
      label: 'Signaler un prix',
    }] : []),
    ...(!user?.role || user?.role !== 'admin' ? [{
      key: '/alerts',
      icon: <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginRight: '8px' }}>
        <BellOutlined />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -8,
            right: -12,
            background: '#E31B23',
            color: '#fff',
            borderRadius: '10px',
            padding: '0 6px',
            fontSize: '10px',
            minWidth: '18px',
            textAlign: 'center',
            lineHeight: '18px'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>,
      label: 'Alertes',
    }] : []),
    ...(user?.role === 'admin' ? [{
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Utilisateurs',
    },
    {
      key: '/reports',
      icon: <FlagOutlined />,
      label: 'Signalements',
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
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          width={280}
          styles={{
            header: { display: 'none' },
            body: { padding: 0, background: '#001529' }
          }}
        >
          <div style={{
            padding: '24px 20px',
            background: 'linear-gradient(135deg, #00853F 0%, #00954A 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Avatar size={48} style={{ backgroundColor: '#fff', color: '#00853F', fontSize: '18px', fontWeight: 'bold' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ background: 'transparent', borderRight: 0 }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: '#001529'
          }}>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                color: 'rgba(255,255,255,0.65)',
                width: '100%',
                justifyContent: 'flex-start',
                height: 'auto',
                padding: '8px 12px'
              }}
            >
              Déconnexion
            </Button>
          </div>
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
            {user?.role !== 'admin' && (
              <div 
                onClick={() => navigate('/alerts')}
                style={{ display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', marginRight: '8px' }}
              >
                <BellOutlined style={{ fontSize: '18px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -12,
                    background: '#E31B23',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '0 6px',
                    fontSize: '10px',
                    minWidth: '18px',
                    textAlign: 'center',
                    lineHeight: '18px'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            )}
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
