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
      <div className="auth-split">
        <div className="auth-left">
          <img 
            src={LogoImage} 
            alt="SénPrix" 
            className="auth-left-logo"
          />
          <h1>SénPrix</h1>
          <p>Rejoignez-nous pour suivre les prix du marché au Sénégal</p>
        </div>
        
        <div className="auth-right">
          <div className="auth-card" style={{ maxWidth: 480 }}>
            <div className="auth-header">
              <Title level={3} style={{ marginBottom: 8, color: '#262626', fontWeight: 600 }}>
                Créer un compte
              </Title>
              <Text type="secondary">Inscrivez-vous pour commencer</Text>
            </div>

            <Form
              name="register"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
              style={{ marginTop: 32 }}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                  name="firstName"
                  rules={[{ required: true, message: 'Prénom requis' }]}
                  style={{ flex: 1 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                    placeholder="Prénom"
                    size="large"
                    style={{ height: 48 }}
                  />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  rules={[{ required: true, message: 'Nom requis' }]}
                  style={{ flex: 1 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                    placeholder="Nom"
                    size="large"
                    style={{ height: 48 }}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Email requis' },
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
                name="phone"
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Téléphone (optionnel)"
                  size="large"
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Mot de passe requis' },
                  { min: 6, message: 'Minimum 6 caractères' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Mot de passe"
                  size="large"
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Confirmation requise' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mot de passe différent'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Confirmer le mot de passe"
                  size="large"
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                  className="senprix-btn-primary"
                >
                  S'inscrire
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '16px 0' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Déjà inscrit?</Text>
            </Divider>

            <Button
              type="default"
              block
              size="large"
              style={{ height: 48, fontSize: 15 }}
              onClick={() => navigate('/login')}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;