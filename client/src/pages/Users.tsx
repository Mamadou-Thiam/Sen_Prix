import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, message, Space, Tag, Typography, Avatar, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { userService } from '../services/api';
import { User } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [form] = Form.useForm();

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

  const handleVerifyMerchant = async (id: string, isVerified: boolean) => {
    try {
      await userService.verifyMerchant(id, isVerified);
      message.success(isVerified ? 'Commerçant vérifié' : 'Vérification annulée');
      fetchUsers();
    } catch (error) {
      message.error('Erreur');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateRole = async (id: string, role: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await userService.updateRole(id, role);
      message.success('Rôle mis à jour');
      fetchUsers();
    } catch (error) {
      message.error('Erreur');
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

  const getRoleTag = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'red',
      moderator: 'blue',
      user: 'green',
      merchant: 'gold'
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      moderator: 'Modérateur',
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
    {
      title: 'Vérifié',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified: boolean, record: User) => {
        if (record.role !== 'merchant') return '-';
        return verified ? <Tag color="green">Oui</Tag> : <Tag color="orange">Non</Tag>;
      }
    },
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
          {record.role === 'merchant' && (
            <Switch
              checked={record.isVerified}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(checked) => handleVerifyMerchant(record._id, checked)}
            />
          )}
          <Button
            type="text"
            onClick={() => handleEdit(record)}
          >
            Modifier le rôle
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Utilisateurs</Title>
        <Text type="secondary">Gérez les utilisateurs de la plateforme</Text>
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
              <Option value="moderator">Modérateur</Option>
              <Option value="admin">Administrateur</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
