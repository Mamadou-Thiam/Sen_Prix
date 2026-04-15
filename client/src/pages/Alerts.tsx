import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Button, Typography, Space, Badge, Empty, message, Popconfirm, Row, Col } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setAlerts, setUnreadCount, markAsRead } from '../store';
import { alertService } from '../services/api';
import { Alert } from '../types';

const { Title, Text } = Typography;

const Alerts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dispatch = useDispatch<AppDispatch>();
  const { alerts, unreadCount } = useSelector((state: RootState) => state.alerts);

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertService.getAll({
        page: 1,
        limit: 50,
        unreadOnly: filter === 'unread'
      });
      if (response.data.success) {
        dispatch(setAlerts(response.data.alerts));
        dispatch(setUnreadCount(response.data.unreadCount));
      }
    } catch (error) {
      message.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertService.markAsRead(id);
      dispatch(markAsRead(id));
      message.success('Alerte marquée comme lue');
    } catch (error) {
      message.error('Erreur');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertService.markAllAsRead();
      fetchAlerts();
      message.success('Toutes les alertes marquées comme lues');
    } catch (error) {
      message.error('Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertService.delete(id);
      fetchAlerts();
      message.success('Alerte supprimée');
    } catch (error) {
      message.error('Erreur');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high_price':
        return <WarningOutlined style={{ color: '#E31B23', fontSize: '24px' }} />;
      case 'suspicious_variation':
        return <ExclamationCircleOutlined style={{ color: '#FCD116', fontSize: '24px' }} />;
      case 'penurie':
        return <WarningOutlined style={{ color: '#FF9800', fontSize: '24px' }} />;
      default:
        return <BellOutlined />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high_price':
        return 'alert-high-price';
      case 'suspicious_variation':
        return 'alert-suspicious';
      case 'penurie':
        return 'alert-penurie';
      default:
        return '';
    }
  };

  const getAlertTag = (type: string) => {
    switch (type) {
      case 'high_price':
        return <Tag color="red">Prix élevé</Tag>;
      case 'suspicious_variation':
        return <Tag color="gold">Variation suspecte</Tag>;
      case 'penurie':
        return <Tag color="orange">Pénurie</Tag>;
      default:
        return <Tag>Alerte</Tag>;
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>Alertes</Title>
          <Text type="secondary">
            <Badge count={unreadCount} offset={[10, 0]} size="small">
              <span>{unreadCount} alerte{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}</span>
            </Badge>
          </Text>
        </div>
        <Space>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
          <Button
            type={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => setFilter('unread')}
          >
            Non lues
          </Button>
          {unreadCount > 0 && (
            <Button
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          {alerts.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Aucune alerte"
            />
          ) : (
            <List
              loading={loading}
              dataSource={alerts}
              renderItem={(alert: Alert) => (
                <Card
                  className={`${getAlertColor(alert.type)} ${!alert.isRead ? 'alert-unread' : ''}`}
                  style={{ marginBottom: '12px' }}
                  hoverable={!alert.isRead}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Space>
                      {getAlertIcon(alert.type)}
                      <div>
                        {getAlertTag(alert.type)}
                        <div style={{ marginTop: '4px' }}>
                          <Text>{alert.message}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(alert.createdAt).toLocaleString('fr-FR')}
                          {alert.product && ` • ${alert.product.name}`}
                          {alert.market && ` • ${alert.market.name}`}
                        </Text>
                      </div>
                    </Space>
                    <Space>
                      {!alert.isRead && (
                        <Button
                          type="text"
                          icon={<CheckOutlined />}
                          onClick={() => handleMarkAsRead(alert._id)}
                        >
                          Marquer comme lu
                        </Button>
                      )}
                      <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer cette alerte?"
                        onConfirm={() => handleDelete(alert._id)}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              )}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Alerts;
