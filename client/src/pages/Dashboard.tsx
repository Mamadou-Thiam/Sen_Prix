import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Table } from 'antd';
import { ShoppingOutlined, ShopOutlined, FlagOutlined, UserOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { userService, reportService } from '../services/api';
import { Report } from '../types';

const { Title, Text } = Typography;

interface Stats {
  users: number;
  products: number;
  markets: number;
  reports: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ users: 0, products: 0, markets: 0, reports: 0 });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes] = await Promise.all([
        userService.getStats(),
        reportService.getAll({ limit: 5 })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (reportsRes.data.success) {
        setRecentReports(reportsRes.data.reports);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Produit',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (_: any, record: Report) => record.product?.name || '-'
    },
    {
      title: 'Marché',
      dataIndex: ['market', 'name'],
      key: 'market',
      render: (_: any, record: Report) => record.market?.name || '-'
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price?.toFixed(2)} CFA`
    },
    {
      title: 'Signalé par',
      key: 'reporter',
      render: (_: any, record: Report) => (
        <Text>{record.reporterRole === 'merchant' ? 'Commerçant' : 'Citoyen'}</Text>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Bienvenue, {user?.firstName} {user?.lastName}</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Utilisateurs"
              value={stats.users}
              prefix={<UserOutlined style={{ color: '#00853F' }} />}
              valueStyle={{ color: '#00853F' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Produits"
              value={stats.products}
              prefix={<ShoppingOutlined style={{ color: '#00853F' }} />}
              valueStyle={{ color: '#00853F' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Marchés"
              value={stats.markets}
              prefix={<ShopOutlined style={{ color: '#00853F' }} />}
              valueStyle={{ color: '#00853F' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Signalements"
              value={stats.reports}
              prefix={<FlagOutlined style={{ color: '#E31B23' }} />}
              valueStyle={{ color: '#E31B23' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="chart-container" style={{ marginTop: '24px' }}>
        <div className="chart-title">Derniers Signalements</div>
        <Table
          dataSource={recentReports}
          columns={columns}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
};

export default Dashboard;
