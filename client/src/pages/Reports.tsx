import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tag, Typography, Space, Badge, message, Popconfirm, Select, Card, Row, Col } from 'antd';
import { CheckOutlined, DeleteOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { reportService } from '../services/api';
import { Report } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchReports();
    fetchUnreadCount();
  }, [pagination.current, pagination.pageSize]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAll({
        page: pagination.current,
        limit: pagination.pageSize
      });
      if (response.data.success) {
        setReports(response.data.reports);
        setPagination(prev => ({ ...prev, total: response.data.total }));
      }
    } catch (error) {
      message.error('Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await reportService.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await reportService.markAsRead(id);
      message.success('Signalement marqué comme lu');
      fetchReports();
      fetchUnreadCount();
    } catch (error) {
      message.error('Erreur');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await reportService.updateStatus(id, status);
      if (status === 'verified') {
        message.success('Signalement vérifié - Une alerte a été créée');
      } else if (status === 'rejected') {
        message.success('Signalement rejeté');
      } else {
        message.success('Statut mis à jour');
      }
      fetchReports();
      fetchUnreadCount();
    } catch (error) {
      message.error('Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reportService.delete(id);
      message.success('Signalement supprimé');
      fetchReports();
      fetchUnreadCount();
    } catch (error) {
      message.error('Erreur');
    }
  };

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
    if (!report.isRead) {
      handleMarkAsRead(report._id);
    }
  };

  const getTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; label: string }> = {
      price_incorrect: { color: 'red', label: 'Prix incorrect' },
      product_quality: { color: 'orange', label: 'Qualité produit' },
      merchant_behavior: { color: 'purple', label: 'Comportement commerçant' },
      fake_product: { color: 'magenta', label: 'Produit falsifié' },
      other: { color: 'default', label: 'Autre' }
    };
    const config = typeConfig[type] || { color: 'default', label: type };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'gold', label: 'En attente' },
      verified: { color: 'green', label: 'Vérifié' },
      rejected: { color: 'red', label: 'Rejeté' }
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getReporterRoleTag = (role: string) => {
    return role === 'merchant' 
      ? <Tag color="gold">Commerçant</Tag> 
      : <Tag color="green">Citoyen</Tag>;
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeTag(type)
    },
    {
      title: 'Produit',
      dataIndex: ['product', 'name'],
      key: 'productName',
      render: (_: any, record: Report) => (
        <Text>{record.product?.name || '-'}</Text>
      )
    },
    {
      title: 'Marché',
      dataIndex: ['market', 'name'],
      key: 'marketName',
      render: (_: any, record: Report) => (
        <Text>{record.market?.name || '-'}</Text>
      )
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Text strong>{price?.toFixed(2)} CFA</Text>
    },
    {
      title: 'Qté',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Signalé par',
      key: 'reporter',
      render: (_: any, record: Report) => (
        <Space>
          {getReporterRoleTag(record.reporterRole)}
          <Text>{record.reportedBy?.firstName} {record.reportedBy?.lastName}</Text>
        </Space>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Report) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleUpdateStatus(record._id, 'verified')}
                className="senprix-btn-primary"
              >
                Vérifier
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleUpdateStatus(record._id, 'rejected')}
              >
                Rejeter
              </Button>
            </>
          )}
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce signalement?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>Signalements de Prix</Title>
          <Text type="secondary">
            <Badge count={unreadCount} offset={[10, 0]} size="small">
              <span>{unreadCount} signalement{unreadCount !== 1 ? 's' : ''} non lu{unreadCount !== 1 ? 's' : ''}</span>
            </Badge>
          </Text>
        </div>
        {unreadCount > 0 && (
          <Button
            icon={<CheckOutlined />}
            onClick={async () => {
              try {
                await reportService.markAllAsRead();
                fetchReports();
                fetchUnreadCount();
                message.success('Tous les signalements marqués comme lus');
              } catch (error) {
                message.error('Erreur');
              }
            }}
          >
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={24}>
          <Card size="small">
            <Space>
              <WarningOutlined style={{ color: '#E31B23' }} />
              <Text type="secondary">
                Les citoyens et commerçants signalent les prix qui ne correspondent pas aux prix officiels.
                Vérifiez et traitez chaque signalement pour créer des alertes.
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={reports}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
        }}
      />

      <Modal
        title="Détail du signalement"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedReport(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={600}
      >
        {selectedReport && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text type="secondary">Type</Text>
                <div>{getTypeTag(selectedReport.type)}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Statut</Text>
                <div>{getStatusTag(selectedReport.status)}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Date</Text>
                <div>{new Date(selectedReport.createdAt).toLocaleString('fr-FR')}</div>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Text type="secondary">Produit</Text>
                <div><Text strong>{selectedReport.product?.name}</Text></div>
                <Text type="secondary">Catégorie: {selectedReport.product?.category}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Marché</Text>
                <div><Text strong>{selectedReport.market?.name || '-'}</Text></div>
                <Text type="secondary">{selectedReport.market?.city}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={8}>
                <Text type="secondary">Prix signalé</Text>
                <div><Text strong style={{ color: '#E31B23', fontSize: '18px' }}>{selectedReport.price?.toFixed(2)} CFA</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Quantité</Text>
                <div><Text>{selectedReport.quantity}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Signalé par</Text>
                <div>
                  {getReporterRoleTag(selectedReport.reporterRole)}
                  <Text strong> {selectedReport.reportedBy?.firstName} {selectedReport.reportedBy?.lastName}</Text>
                </div>
                <Text type="secondary">{selectedReport.reportedBy?.email}</Text>
              </Col>
            </Row>
            {selectedReport.description && (
              <Row style={{ marginTop: '16px' }}>
                <Col span={24}>
                  <Text type="secondary">Description</Text>
                  <Paragraph>{selectedReport.description}</Paragraph>
                </Col>
              </Row>
            )}
            {selectedReport.status === 'pending' && (
              <Row style={{ marginTop: '16px' }}>
                <Col span={24}>
                  <Text type="secondary">Actions</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Space>
                      <Button 
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleUpdateStatus(selectedReport._id, 'verified')}
                        className="senprix-btn-primary"
                      >
                        Vérifier et créer alerte
                      </Button>
                      <Button 
                        danger
                        onClick={() => handleUpdateStatus(selectedReport._id, 'rejected')}
                      >
                        Rejeter
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
