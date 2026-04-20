import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../services/api';
import { setUser } from '../store';
import LogoImage from '../assets/logo_sp.png';

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
      <div className="auth-split">
        <div className="auth-left">
          <img 
            src={LogoImage} 
            alt="SénPrix" 
            className="auth-left-logo"
          />
          <h1>SénPrix</h1>
          <p>Votre plateforme de suivi des prix du marchés au Sénégal</p>
        </div>
        
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <Title level={3} style={{ marginBottom: 8, color: '#262626', fontWeight: 600 }}>
                Bon retour
              </Title>
              <Text type="secondary">Connectez-vous pour continuer</Text>
            </div>

            <Form
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
              style={{ marginTop: 32 }}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Email"
                  size="large"
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Mot de passe"
                  size="large"
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                  className="senprix-btn-primary"
                >
                  Se connecter
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '24px 0' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Nouveau sur SénPrix?</Text>
            </Divider>

            <Button
              type="default"
              block
              size="large"
              style={{ height: 48, fontSize: 15 }}
              onClick={() => navigate('/register')}
            >
              Créer un compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;