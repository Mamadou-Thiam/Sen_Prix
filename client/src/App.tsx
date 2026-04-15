import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Markets from './pages/Markets';
import Prices from './pages/Prices';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Users from './pages/Users';

const ProtectedRoute: React.FC<{ roles?: string[] }> = ({ roles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="markets" element={<Markets />} />
          <Route path="prices" element={<Prices />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="users" element={<Users />} />
        </Route>
      </Route>
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
