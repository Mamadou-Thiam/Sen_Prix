import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { marketService } from '../services/api';
import { Market } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const Markets: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const { user } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const response = await marketService.getAll({
        page: pagination.current,
        limit: pagination.pageSize
      });
      if (response.data.success) {
        setMarkets(response.data.markets);
        setPagination(prev => ({ ...prev, total: response.data.total }));
      }
    } catch (error) {
      message.error('Erreur lors du chargement des marchés');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMarket) {
        await marketService.update(editingMarket._id, values);
        message.success('Marché mis à jour');
      } else {
        await marketService.create(values);
        message.success('Marché créé');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingMarket(null);
      fetchMarkets();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (market: Market) => {
    setEditingMarket(market);
    form.setFieldsValue({
      ...market,
      city: market.city
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await marketService.delete(id);
      message.success('Marché supprimé');
      fetchMarkets();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ville',
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => <Tag color="blue">{city}</Tag>
    },
    {
      title: 'Adresse',
      dataIndex: 'address',
      key: 'address',
    },
    ...(user?.role === 'admin' || user?.role === 'moderator' ? [{
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Market) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce marché?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }] : [])
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>Marchés</Title>
          <Text type="secondary">
            {user?.role === 'admin' || user?.role === 'moderator' 
              ? 'Gérez les marchés du Sénégal' 
              : 'Liste des marchés du Sénégal'}
          </Text>
        </div>
        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingMarket(null);
              form.resetFields();
              setModalVisible(true);
            }}
            className="senprix-btn-primary"
          >
            Ajouter un marché
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={markets}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
        }}
      />

      <Modal
        title={editingMarket ? 'Modifier le marché' : 'Ajouter un marché'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingMarket(null);
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nom du marché"
            rules={[{ required: true, message: 'Veuillez entrer le nom du marché' }]}
          >
            <Input placeholder="Ex: Marché Sandaga" />
          </Form.Item>

          <Form.Item
            name="city"
            label="Ville"
            rules={[{ required: true, message: 'Veuillez sélectionner une ville' }]}
          >
            <Select placeholder="Sélectionner une ville">
              <Option value="Dakar">Dakar</Option>
              <Option value="Saint-Louis">Saint-Louis</Option>
              <Option value="Thiès">Thiès</Option>
              <Option value="Touba">Touba</Option>
              <Option value="Mbour">Mbour</Option>
              <Option value="Kaolack">Kaolack</Option>
              <Option value="Ziguinchor">Ziguinchor</Option>
              <Option value="Autre">Autre</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Adresse"
          >
            <Input placeholder="Adresse du marché" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Markets;
