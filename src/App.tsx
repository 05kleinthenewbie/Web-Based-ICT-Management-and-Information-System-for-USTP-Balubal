/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import * as React from 'react';
import { Shell } from '@/src/components/layout/Shell';
import Dashboard from '@/src/pages/Dashboard';
import Inventory from '@/src/pages/Inventory';
import Bookings from '@/src/pages/Bookings';
import Requests from '@/src/pages/Requests';
import Incidents from '@/src/pages/Incidents';
import Settings from '@/src/pages/Settings';
import Login from '@/src/pages/Login';
import { AuthProvider, useAuth, UserRole } from '@/src/context/AuthContext';

function RoleGuard({ children, roles }: { children: React.ReactNode, roles: UserRole[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
         <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authenticating Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/inventory" element={
          <RoleGuard roles={['admin']}>
            <Inventory />
          </RoleGuard>
        } />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/incidents" element={
          <RoleGuard roles={['admin']}>
            <Incidents />
          </RoleGuard>
        } />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<AuthenticatedApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
