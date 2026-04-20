import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, Input, message, Space, Tag, Typography, Avatar, Switch, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userService } from '../services/api';
import { logout } from '../store';
import { User } from '../types';
import { RootState } from '../store';

const { Title, Text } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll({
        page: pagination.current,
        limit: pagination.pageSize
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(prev => ({ ...prev, total: response.data.total }));
      }
    } catch (error) {
      message.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, currentUserId: string) => {
    try {
      await userService.delete(id);
      message.success('Utilisateur supprimé');
      if (id === currentUserId) {
        dispatch(logout());
        navigate('/login');
      } else {
        fetchUsers();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({ role: user.role });
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userService.updateRole(editingUser._id, values.role);
        message.success('Rôle mis à jour');
        setModalVisible(false);
        form.resetFields();
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleCreateOk = async () => {
    try {
      const values = await createForm.validateFields();
      await userService.create(values);
      message.success('Utilisateur créé avec succès');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const getRoleTag = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'red',
      user: 'green',
      merchant: 'gold'
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      user: 'Citoyen',
      merchant: 'Commerçant'
    };
    return <Tag color={colors[role]}>{labels[role]}</Tag>;
  };

  const columns = [
    {
      title: 'Utilisateur',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar style={{ backgroundColor: '#00853F' }}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </Avatar>
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <br />
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role)
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-'
    },
    // {
    //   title: 'Vérifié',
    //   dataIndex: 'isVerified',
    //   key: 'isVerified',
    //   render: (verified: boolean, record: User) => {
    //     if (record.role !== 'merchant') return '-';
    //     return verified ? <Tag color="green">Oui</Tag> : <Tag color="orange">Non</Tag>;
    //   }
    // },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet utilisateur?"
            onConfirm={() => handleDelete(record._id, currentUser?._id || '')}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>Utilisateurs</Title>
          <Text type="secondary">Gérez les utilisateurs de la plateforme</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="senprix-btn-primary"
        >
          Ajouter un utilisateur
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
        }}
      />

      <Modal
        title="Modifier le rôle"
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
          >
            <Select placeholder="Sélectionner un rôle">
              <Option value="user">Citoyen</Option>
              <Option value="merchant">Commerçant</Option>
              <Option value="admin">Administrateur</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Ajouter un utilisateur"
        open={createModalVisible}
        onOk={handleCreateOk}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        width={500}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez entrer un email' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input placeholder="email@exemple.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Veuillez entrer un mot de passe' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
            ]}
          >
            <Input.Password placeholder="Mot de passe (min. 6 caractères)" />
          </Form.Item>

          <Form.Item
            name="firstName"
            label="Prénom"
            rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}
          >
            <Input placeholder="Prénom" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Nom"
            rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
          >
            <Input placeholder="Nom" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Téléphone"
          >
            <Input placeholder="+221 XX XXX XX XX" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
          >
            <Select placeholder="Sélectionner un rôle">
              <Option value="user">Citoyen</Option>
              <Option value="merchant">Commerçant</Option>
              <Option value="admin">Administrateur</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
