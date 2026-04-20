import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider, Select } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import LogoImage from '../assets/logo_sp.png';

const { Title, Text } = Typography;

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = values;
      const response = await authService.register(registerData);
      if (response.data.success) {
        message.success('Compte créé avec succès. Veuillez vous connecter.');
        navigate('/login');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img 
              src={LogoImage} 
              alt="SénPrix" 
              style={{ 
                width: '120px', 
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 133, 63, 0.3)'
              }} 
            />
          </div>
          <Title level={3} className="auth-title">Inscription</Title>
          <Text className="auth-subtitle">Créez un compte pour rejoindre SénPrix</Text>
        </div>

        <Form
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: 'Veuillez entrer votre prénom' }]}
              style={{ flex: '1 1 auto', minWidth: 'calc(50% - 8px)' }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Prénom"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[{ required: true, message: 'Veuillez entrer votre nom' }]}
              style={{ flex: '1 1 auto', minWidth: 'calc(50% - 8px)' }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nom"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Veuillez entrer votre email' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Téléphone (optionnel)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            initialValue="user"
          >
            <Select size="large" placeholder="Type de compte">
              <Select.Option value="user">Citoyen</Select.Option>
              <Select.Option value="merchant">Commerçant</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Veuillez entrer un mot de passe' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mot de passe"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: 'Veuillez confirmer votre mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirmer le mot de passe"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="senprix-btn-primary"
            >
              S'inscrire
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Déjà inscrit?</Text>
        </Divider>

        <Button
          type="default"
          block
          size="large"
          onClick={() => navigate('/login')}
        >
          Se connecter
        </Button>
      </div>
    </div>
  );
};

export default Register;
