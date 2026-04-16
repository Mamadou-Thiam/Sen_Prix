import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Table } from 'antd';
import { ShoppingOutlined, ShopOutlined, FlagOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { userService, reportService, priceService } from '../services/api';
import { Report } from '../types';

const { Title, Text } = Typography;

interface Stats {
  users: number;
  products: number;
  markets: number;
  reports: number;
}

interface DashboardStats {
  reportsByStatus: { _id: string; count: number }[];
  reportsByDay: { _id: string; count: number }[];
  pricesByProduct: { name: string; avgPrice: number; count: number }[];
  pricesByCity: { _id: string; count: number; avgPrice: number }[];
}

const COLORS = ['#00853F', '#E31B23', '#FCD116', '#FF9800', '#9C27B0'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ users: 0, products: 0, markets: 0, reports: 0 });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, dashStatsRes] = await Promise.all([
        userService.getStats(),
        reportService.getAll({ limit: 5 }),
        priceService.getDashboardStats()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (reportsRes.data.success) {
        setRecentReports(reportsRes.data.reports);
      }
      if (dashStatsRes.data.success) {
        setDashboardStats(dashStatsRes.data);
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
        <Text>{record.reportedBy?.firstName} {record.reportedBy?.lastName}</Text>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
    },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return 'Vérifiés';
      case 'rejected': return 'Rejetés';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#00853F';
      case 'rejected': return '#E31B23';
      case 'pending': return '#FCD116';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircleOutlined style={{ color: '#00853F' }} />;
      case 'rejected': return <CloseCircleOutlined style={{ color: '#E31B23' }} />;
      case 'pending': return <ClockCircleOutlined style={{ color: '#FCD116' }} />;
      default: return null;
    }
  };

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

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Signalements par statut">
            {dashboardStats?.reportsByStatus && dashboardStats.reportsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardStats.reportsByStatus}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${getStatusLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardStats.reportsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry._id)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} signalements`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">Aucune donnée disponible</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Signalements quotidiens (30 derniers jours)">
            {dashboardStats?.reportsByDay && dashboardStats.reportsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dashboardStats.reportsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#00853F" strokeWidth={2} name="Signalements" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">Aucune donnée disponible</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="Prix moyens par produit">
            {dashboardStats?.pricesByProduct && dashboardStats.pricesByProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardStats.pricesByProduct} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => `${value?.toFixed(0)} CFA`} />
                  <Bar dataKey="avgPrice" fill="#00853F" name="Prix moyen (CFA)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">Aucune donnée disponible</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Prix par ville">
            {dashboardStats?.pricesByCity && dashboardStats.pricesByCity.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardStats.pricesByCity.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00853F" name="Nombre de prix" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">Aucune donnée disponible</Text>
              </div>
            )}
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