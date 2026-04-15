import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Table } from 'antd';
import { ShoppingOutlined, ShopOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { userService, priceService } from '../services/api';

const { Title, Text } = Typography;

interface Stats {
  users: number;
  products: number;
  markets: number;
  prices: number;
}

interface PriceStat {
  productName: string;
  marketName: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#00853F', '#FCD116', '#E31B23', '#2E7D32', '#F9A825', '#C62828'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ users: 0, products: 0, markets: 0, prices: 0 });
  const [priceStats, setPriceStats] = useState<PriceStat[]>([]);
  const [priceHistory, setPriceHistory] = useState<ChartData[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, priceStatsRes] = await Promise.all([
        userService.getStats(),
        priceService.getStats()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (priceStatsRes.data.success) {
        setPriceStats(priceStatsRes.data.stats.slice(0, 10));
        
        const historyData = priceStatsRes.data.stats.slice(0, 5).map((s: PriceStat) => ({
          name: s.productName,
          value: s.avgPrice
        }));
        setPriceHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = priceStats.reduce((acc, curr) => {
    const existing = acc.find((item: ChartData) => item.name === curr.productName);
    if (existing) {
      existing.value += curr.count;
    } else {
      acc.push({ name: curr.productName, value: curr.count });
    }
    return acc;
  }, [] as ChartData[]);

  const columns = [
    {
      title: 'Produit',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Marché',
      dataIndex: 'marketName',
      key: 'marketName',
    },
    {
      title: 'Prix Moy.',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
      render: (value: number) => `${value.toFixed(2)} CFA`,
    },
    {
      title: 'Min',
      dataIndex: 'minPrice',
      key: 'minPrice',
      render: (value: number) => `${value.toFixed(2)} CFA`,
    },
    {
      title: 'Max',
      dataIndex: 'maxPrice',
      key: 'maxPrice',
      render: (value: number) => `${value.toFixed(2)} CFA`,
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
              title="Prix Enregistrés"
              value={stats.prices}
              prefix={<DollarOutlined style={{ color: '#00853F' }} />}
              valueStyle={{ color: '#00853F' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <div className="chart-container">
            <div className="chart-title">Prix Moyens par Produit</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00853F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="chart-container">
            <div className="chart-title">Distribution des Prix</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry: ChartData, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>

      <div className="chart-container" style={{ marginTop: '24px' }}>
        <div className="chart-title">Derniers Prix Enregistrés</div>
        <Table
          dataSource={priceStats}
          columns={columns}
          rowKey={(record) => `${record.productName}-${record.marketName}`}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </div>
    </div>
  );
};

export default Dashboard;
