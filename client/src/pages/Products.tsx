import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { productService } from '../services/api';
import { Product } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const { user } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({
        page: pagination.current,
        limit: pagination.pageSize
      });
      if (response.data.success) {
        setProducts(response.data.products);
        setPagination(prev => ({ ...prev, total: response.data.total }));
      }
    } catch (error) {
      message.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        await productService.update(editingProduct._id, values);
        message.success('Produit mis à jour');
      } else {
        await productService.create(values);
        message.success('Produit créé');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.delete(id);
      message.success('Produit supprimé');
      fetchProducts();
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
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const colors: Record<string, string> = {
          riz: 'green',
          huile: 'gold',
          sucre: 'blue',
          farine: 'orange',
          lait: 'purple',
          gaz: 'red',
          autre: 'default'
        };
        return <Tag color={colors[category] || 'default'}>{category.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Unité',
      dataIndex: 'unit',
      key: 'unit',
    },
    ...(user?.role === 'admin' ? [{
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce produit?"
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
          <Title level={2}>Produits</Title>
          <Text type="secondary">Gérez les produits de première nécessité</Text>
        </div>
        {user?.role === 'admin' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingProduct(null);
              form.resetFields();
              setModalVisible(true);
            }}
            className="senprix-btn-primary"
          >
            Ajouter un produit
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
        }}
      />

      <Modal
        title={editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingProduct(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nom du produit"
            rules={[{ required: true, message: 'Veuillez entrer le nom du produit' }]}
          >
            <Input placeholder="Ex: Riz importé" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Catégorie"
            rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
          >
            <Select placeholder="Sélectionner une catégorie">
              <Option value="riz">Riz</Option>
              <Option value="huile">Huile</Option>
              <Option value="sucre">Sucre</Option>
              <Option value="farine">Farine</Option>
              <Option value="lait">Lait</Option>
              <Option value="gaz">Gaz</Option>
              <Option value="autre">Autre</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Description du produit" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unité"
            initialValue="kg"
          >
            <Select>
              <Option value="kg">Kilogramme (kg)</Option>
              <Option value="litre">Litre</Option>
              <Option value="bundle">Paquet</Option>
              <Option value="piece">Pièce</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
