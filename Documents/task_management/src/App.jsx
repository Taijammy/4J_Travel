// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }            from './context/AuthContext';
import ProtectedRoute, { AdminRoute } from './components/layout/ProtectedRoute';
import Layout      from './components/layout/Layout';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Tasks       from './pages/Tasks';
import AdminPanel  from './pages/AdminPanel';

const App = () => (
  <AuthProvider>
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected — any logged in user */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <Layout><Tasks /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin only — redirects to /dashboard if not admin */}
      <Route path="/admin" element={
        <AdminRoute>
          <Layout><AdminPanel /></Layout>
        </AdminRoute>
      } />

      {/* Default */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;