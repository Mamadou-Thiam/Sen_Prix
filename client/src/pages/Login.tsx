import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../services/api';
import { setUser } from '../store';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      if (response.data.success) {
        dispatch(setUser({
          user: response.data.user,
          token: response.data.token
        }));
        message.success('Connexion réussie');
        navigate('/dashboard');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <span className="logo-green">Sén</span>
            <span className="logo-yellow">Prix</span>
          </div>
          <Title level={3} className="auth-title">Connexion</Title>
          <Text className="auth-subtitle">Connectez-vous pour accéder à la plateforme</Text>
        </div>

        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
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
            name="password"
            rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mot de passe"
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
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Nouveau sur SénPrix?</Text>
        </Divider>

        <Button
          type="default"
          block
          size="large"
          onClick={() => navigate('/register')}
        >
          Créer un compte
        </Button>
      </div>
    </div>
  );
};

export default Login;
