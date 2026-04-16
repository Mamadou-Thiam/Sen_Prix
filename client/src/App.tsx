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
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Reports from './pages/Reports';
import ReportPrice from './pages/ReportPrice';

const ProtectedRoute: React.FC<{ roles?: string[] }> = ({ roles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/report-price" replace />;
  }
  
  return <Outlet />;
};

const NonAdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === 'admin') {
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
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="products" element={<Products />} />
          <Route path="markets" element={<Markets />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        <Route element={<NonAdminRoute />}>
          <Route path="report-price" element={<ReportPrice />} />
        </Route>
      </Route>
      
      <Route path="/" element={<Navigate to="/report-price" replace />} />
      <Route path="*" element={<Navigate to="/report-price" replace />} />
    </Routes>
  );
}

export default App;
