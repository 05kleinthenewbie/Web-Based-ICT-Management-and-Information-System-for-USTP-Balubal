/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Calendar,
  AlertTriangle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Service Requests', icon: ClipboardList, href: '/requests' },
  { label: 'Inventory', icon: Package, href: '/inventory', roles: ['admin'] },
  { label: 'Bookings', icon: Calendar, href: '/bookings' },
  { label: 'Incidents', icon: AlertTriangle, href: '/incidents', roles: ['admin'] },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const activeItem = filteredNavItems.find((item) => item.href === location.pathname) || navItems[0];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="hidden md:flex flex-col bg-[#0F172A] z-30 overflow-hidden shrink-0"
      >
        <div className="p-6 border-b border-slate-700/50">
          <h1 className="text-white font-bold text-lg tracking-tight">
            USTP <span className="text-orange-500">ICT - Management and Information System</span>
          </h1>
          {isSidebarOpen && (
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Balubal Campus</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded transition-colors group text-xs font-medium',
                location.pathname === item.href
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', location.pathname === item.href ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
              {(isSidebarOpen || isMobileMenuOpen) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {item.label}
                </motion.span>
              )}
              {location.pathname === item.href && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs text-white font-semibold truncate leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 capitalize mt-1">{user?.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-3 px-3 py-1.5 w-full text-left text-slate-400 hover:text-white rounded transition-colors text-[10px] font-bold uppercase tracking-wider"
          >
            <Menu className="w-3.5 h-3.5 flex-shrink-0" />
            {isSidebarOpen && <span>Collapse Menu</span>}
          </button>
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-3 py-1.5 w-full text-left text-rose-400 hover:text-rose-300 rounded transition-colors mt-1 text-[10px] font-bold uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:bg-slate-50 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-slate-900 md:hidden">USTP ICT</h1>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                {activeItem.label}
              </span>
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                Status: <span className="text-emerald-500 font-bold">Operational</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer group">
                <Bell className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
                <span className="hidden sm:inline ml-1.5 text-[10px] font-bold text-slate-500 group-hover:text-slate-700">Notifications</span>
              </div>
            </div>
            <Link to="/requests">
              <Button size="sm" className="bg-orange-500 text-white font-bold tracking-tight">
                + NEW REQUEST
              </Button>
            </Link>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 md:hidden flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">USTP</span>
                  </div>
                  <span className="font-bold text-gray-900">ICT System</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2 flex-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-xl transition-all',
                      location.pathname === item.href
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-2">
                <button 
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-4 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
