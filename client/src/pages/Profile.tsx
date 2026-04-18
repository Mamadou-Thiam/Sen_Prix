import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Avatar, Tag, Rate } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, ShopOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../store';
import { userService } from '../services/api';

const { Title, Text } = Typography;

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
}

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: ProfileForm) => {
    setLoading(true);
    try {
      const { data } = await userService.updateProfile(values);
      dispatch(updateUser(data.user));
      message.success('Profil mis à jour avec succès');
    } catch (error) {
      message.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTag = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'red',
      user: 'green',
      merchant: 'gold'
    };
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      user: 'Citoyen',
      merchant: 'Commerçant'
    };
    return <Tag color={colors[role]}>{labels[role]}</Tag>;
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Mon Profil</Title>
        <Text type="secondary">Gérez vos informations personnelles</Text>
      </div>

      <div style={{ maxWidth: 600 }}>
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Avatar size={100} style={{ backgroundColor: '#00853F', fontSize: '36px' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Title level={3} style={{ marginTop: '16px', marginBottom: '4px' }}>
              {user?.firstName} {user?.lastName}
            </Title>
            {getRoleTag(user?.role || 'user')}
            {user?.role === 'merchant' && user?.isVerified && (
              <Tag color="green">Vérifié</Tag>
            )}
            {user?.role === 'merchant' && !user?.isVerified && (
              <Tag color="orange">En attente de vérification</Tag>
            )}
          </div>

          {user?.role === 'merchant' && user?.averageRating > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Text>Note moyenne: </Text>
              <Rate disabled value={user.averageRating} allowHalf />
              <Text> ({user.averageRating.toFixed(1)})</Text>
            </div>
          )}
        </Card>

        <Card title="Informations personnelles">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              firstName: user?.firstName,
              lastName: user?.lastName,
              email: user?.email,
              phone: user?.phone,
              market: user?.market?.name
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="firstName"
              label="Prénom"
              rules={[{ required: true }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Nom"
              rules={[{ required: true }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
            >
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Téléphone"
            >
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>

            {user?.role === 'merchant' && (
              <Form.Item
                name="market"
                label="Marché"
              >
                <Input prefix={<ShopOutlined />} disabled />
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="senprix-btn-primary"
              >
                Enregistrer
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
