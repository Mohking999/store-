import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { HomePage } from '../pages/HomePage';
const LoginPage = React.lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const TechnicianDashboardPage = React.lazy(() => import('../pages/TechnicianDashboardPage').then((module) => ({ default: module.TechnicianDashboardPage })));
const RepairDetailsPage = React.lazy(() => import('../pages/RepairDetailsPage').then((module) => ({ default: module.RepairDetailsPage })));
const AdminDashboardPage = React.lazy(() => import('../pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-500">
        Vérification de l'authentification...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-sm text-slate-500">Loading…</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Technician Dashboard */}
        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
              <TechnicianDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Repair Details & Workbench */}
        <Route
          path="/repairs/:id"
          element={
            <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
              <RepairDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};
