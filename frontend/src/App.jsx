import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login  from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';

// Owner pages
import OwnerDashboard from './pages/Owner/OwnerDashboard';

// User pages
import UserDashboard from './pages/User/UserDashboard';
import UserProfile   from './pages/User/UserProfile';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"       element={<Navigate to="/login" replace />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── System Admin ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Store Owner ── */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Normal User ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['NORMAL_USER']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Shared: Change Password (Normal User + Store Owner) ── */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['NORMAL_USER', 'STORE_OWNER']}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;