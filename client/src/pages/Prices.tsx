import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, DatePicker, message, Typography, Tag, Tabs, Space } from 'antd';
import { PlusOutlined, FilterOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { priceService, productService, marketService } from '../services/api';
import { Product, Market, Price } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const Prices: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [prices, setPrices] = useState<Price[]>([]);
  const [pendingPrices, setPendingPrices] = useState<Price[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<{ product?: string; market?: string; startDate?: string; endDate?: string }>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [pendingPagination, setPendingPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts();
    fetchMarkets();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'all') {
      fetchPrices();
    } else if (activeTab === 'pending' && isAdmin) {
      fetchPendingPrices();
    }
  }, [pagination.current, pagination.pageSize, filters, activeTab, pendingPagination.current]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await priceService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      });
      if (response.data.success) {
        setPrices(response.data.prices);
        setPagination(prev => ({ ...prev, total: response.data.total }));
      }
    } catch (error) {
      message.error('Erreur lors du chargement des prix');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPrices = async () => {
    try {
      setLoading(true);
      const response = await priceService.getPending({
        page: pendingPagination.current,
        limit: pendingPagination.pageSize
      });
      if (response.data.success) {
        setPendingPrices(response.data.prices);
        setPendingPagination(prev => ({ ...prev, total: response.data.total }));
      }
    } catch (error) {
      message.error('Erreur lors du chargement des prix en attente');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 100 });
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchMarkets = async () => {
    try {
      const response = await marketService.getAll({ limit: 100 });
      if (response.data.success) {
        setMarkets(response.data.markets);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const priceData = {
        ...values,
        date: values.date?.toISOString()
      };
      await priceService.create(priceData);
      message.success('Prix ajouté avec succès');
      setModalVisible(false);
      form.resetFields();
      fetchPrices();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de l\'ajout du prix');
    }
  };

  const handleFilter = async (values: any) => {
    const newFilters: any = {};
    if (values.product) newFilters.product = values.product;
    if (values.market) newFilters.market = values.market;
    if (values.startDate) newFilters.startDate = values.startDate.toISOString();
    if (values.endDate) newFilters.endDate = values.endDate.toISOString();
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await priceService.verify(id, isVerified);
      message.success(isVerified ? 'Prix validé' : 'Prix rejeté');
      fetchPendingPrices();
    } catch (error) {
      message.error('Erreur lors de la vérification');
    }
  };

  const allColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      title: 'Produit',
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: 'Marché',
      dataIndex: ['market', 'name'],
      key: 'market',
    },
    {
      title: 'Prix (CFA)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <strong>{price.toFixed(2)}</strong>
    },
    {
      title: 'Quantité',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Signalé par',
      dataIndex: ['user', 'firstName'],
      key: 'user',
      render: (_: any, record: Price) => `${record.user?.firstName} ${record.user?.lastName}`
    },
    {
      title: 'Statut',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified: boolean) => verified ? 
        <Tag color="green">Vérifié</Tag> : 
        <Tag color="orange">En attente</Tag>
    },
  ];

  const pendingColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      title: 'Produit',
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: 'Marché',
      dataIndex: ['market', 'name'],
      key: 'market',
    },
    {
      title: 'Prix (CFA)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <strong>{price.toFixed(2)}</strong>
    },
    {
      title: 'Signalé par',
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: Price) => record.user ? `${record.user.firstName} ${record.user.lastName}` : '-'
    },
    {
      title: 'Contact',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Price) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckOutlined />} 
            onClick={() => handleVerify(record._id, true)}
            className="senprix-btn-primary"
          >
            Valider
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<CloseOutlined />} 
            onClick={() => handleVerify(record._id, false)}
          >
            Rejeter
          </Button>
        </Space>
      )
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: 'Tous les prix',
      children: (
        <>
          <div className="filter-form" style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
            <Form layout="vertical" onFinish={handleFilter}>
              <Form.Item name="product" style={{ marginBottom: '8px' }}>
                <Select placeholder="Produit" allowClear style={{ width: '100%' }}>
                  {products.map(p => (
                    <Option key={p._id} value={p._id}>{p.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="market" style={{ marginBottom: '8px' }}>
                <Select placeholder="Marché" allowClear style={{ width: '100%' }}>
                  {markets.map(m => (
                    <Option key={m._id} value={m._id}>{m.name} - {m.city}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="startDate" style={{ marginBottom: '8px' }}>
                <DatePicker placeholder="Date début" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="endDate" style={{ marginBottom: '8px' }}>
                <DatePicker placeholder="Date fin" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item style={{ marginBottom: '8px' }}>
                <Button type="primary" htmlType="submit" icon={<FilterOutlined />} block>
                  Filtrer
                </Button>
              </Form.Item>
            </Form>
          </div>

          <Table
            columns={allColumns}
            dataSource={prices}
            rowKey="_id"
            loading={loading}
            scroll={{ x: 600 }}
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
            }}
          />
        </>
      )
    },
    ...(isAdmin ? [{
      key: 'pending',
      label: `En attente (${pendingPagination.total})`,
      children: (
        <Table
          columns={pendingColumns}
          dataSource={pendingPrices}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 600 }}
          pagination={{
            ...pendingPagination,
            onChange: (page, pageSize) => setPendingPagination(prev => ({ ...prev, current: page, pageSize }))
          }}
        />
      )
    }] : [])
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>Signalement des Prix</Title>
          <Text type="secondary">Enregistrez et consultez les prix des produits</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          className="senprix-btn-primary"
        >
          Ajouter un prix
        </Button>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />

      <Modal
        title="Ajouter un prix"
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product"
            label="Produit"
            rules={[{ required: true, message: 'Veuillez sélectionner un produit' }]}
          >
            <Select placeholder="Sélectionner un produit" showSearch>
              {products.map(p => (
                <Option key={p._id} value={p._id}>{p.name} ({p.category})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="market"
            label="Marché"
            rules={[{ required: true, message: 'Veuillez sélectionner un marché' }]}
          >
            <Select placeholder="Sélectionner un marché" showSearch>
              {markets.map(m => (
                <Option key={m._id} value={m._id}>{m.name} - {m.city}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Prix (CFA)"
            rules={[{ required: true, message: 'Veuillez entrer le prix' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={10}
              placeholder="Prix en CFA"
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantité"
            initialValue="1"
          >
            <Input placeholder="Ex: 1 kg, 5 litres" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Prices;
