import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Typography, message, Row, Col, Divider, Table, Tag, Space } from 'antd';
import { FlagOutlined, InfoCircleOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { reportService, productService, marketService } from '../services/api';
import { Product, Market, Report } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ReportPrice: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchMarkets();
    fetchMyReports();
  }, []);

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

  const fetchMyReports = async () => {
    try {
      setReportsLoading(true);
      const response = await reportService.getMyReports({ limit: 20 });
      if (response.data.success) {
        setMyReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching my reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await reportService.create({
        type: values.type,
        description: values.description,
        product: values.product,
        market: values.market,
        price: values.price,
        quantity: values.quantity || '1',
        reporterRole: user?.role === 'merchant' ? 'merchant' : 'user'
      });
      message.success('Signalement envoyé avec succès. L\'administrateur l\'examinera.');
      form.resetFields();
      fetchMyReports();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de l\'envoi du signalement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'verified':
        return <Tag color="green" icon={<CheckOutlined />}>Vérifié</Tag>;
      case 'rejected':
        return <Tag color="red" icon={<CloseOutlined />}>Rejeté</Tag>;
      default:
        return <Tag color="gold" icon={<ClockCircleOutlined />}>En attente</Tag>;
    }
  };

  const getTypeTag = (type: string) => {
    const typeConfig: Record<string, string> = {
      price_incorrect: 'Prix incorrect',
      product_quality: 'Qualité produit',
      merchant_behavior: 'Comportement',
      fake_product: 'Produit falsifié',
      other: 'Autre'
    };
    return typeConfig[type] || type;
  };

  const myReportsColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      title: 'Produit',
      dataIndex: ['product', 'name'],
      key: 'productName'
    },
    {
      title: 'Marché',
      dataIndex: ['market', 'name'],
      key: 'marketName'
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Text strong>{price?.toFixed(2)} CFA</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeTag(type)
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Signaler un Prix</Title>
        <Text type="secondary">
          Signalez les prix qui ne correspondent pas aux prix officiels de l'État
        </Text>
      </div>

      <Row justify="center">
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <Paragraph>
                <InfoCircleOutlined style={{ color: '#00853F', marginRight: '8px' }} />
                <Text>
                  Si vous constatez qu'un commerçant vend un produit à un prix différent 
                  du prix officiel fixé par l'État, signalez-le ici. L'administrateur 
                  vérifiera votre signalement et prendra les mesures nécessaires.
                </Text>
              </Paragraph>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ quantity: '1' }}
            >
              <Form.Item
                name="product"
                label="Produit"
                rules={[{ required: true, message: 'Veuillez sélectionner un produit' }]}
              >
                <Select 
                  placeholder="Sélectionner un produit" 
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {products.map(p => (
                    <Option key={p._id} value={p._id}>
                      {p.name} ({p.category})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="market"
                label="Marché"
                rules={[{ required: true, message: 'Veuillez sélectionner un marché' }]}
              >
                <Select 
                  placeholder="Sélectionner un marché" 
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {markets.map(m => (
                    <Option key={m._id} value={m._id}>
                      {m.name} - {m.city}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Prix constaté (CFA)"
                    rules={[{ required: true, message: 'Veuillez entrer le prix' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={10}
                      placeholder="Ex: 650"
                      addonAfter="CFA"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="quantity"
                    label="Quantité"
                  >
                    <Select placeholder="Quantité">
                      <Option value="1">1 kg</Option>
                      <Option value="2">2 kg</Option>
                      <Option value="5">5 kg</Option>
                      <Option value="10">10 kg</Option>
                      <Option value="25">25 kg</Option>
                      <Option value="50">50 kg</Option>
                      <Option value="bouteille">Bouteille</Option>
                      <Option value="bundle">Bundle</Option>
                      <Option value="piece">Pièce</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="type"
                label="Type de signalement"
                rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
              >
                <Select placeholder="Sélectionner le type de problème">
                  <Option value="price_incorrect">Prix différent du prix officiel</Option>
                  <Option value="product_quality">Qualité du produit non conforme</Option>
                  <Option value="merchant_behavior">Comportement frauduleux du commerçant</Option>
                  <Option value="fake_product">Produit falsifié ou périmé</Option>
                  <Option value="other">Autre problème</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="Description (optionnel)"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Ajoutez des détails supplémentaires si nécessaire..." 
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Divider />

              <Row gutter={16} align="middle">
                <Col span={12}>
                  <Text type="secondary">
                    Signalé par: <Text strong>{user?.role === 'merchant' ? 'Commerçant' : 'Citoyen'}</Text>
                    {' '}{user?.firstName} {user?.lastName}
                  </Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<FlagOutlined />}
                    size="large"
                    className="senprix-btn-primary"
                  >
                    Envoyer le signalement
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {myReports.length > 0 && (
            <Card style={{ marginTop: '24px' }} title="Mes signalements">
              <Table
                columns={myReportsColumns}
                dataSource={myReports}
                rowKey="_id"
                loading={reportsLoading}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ReportPrice;
