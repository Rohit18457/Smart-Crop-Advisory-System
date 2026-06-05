import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Activity, MessageSquare, Database, MapPin,
  BellRing, Languages, X, ChevronRight, LogOut, ArrowLeft, Shield
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Predictions', href: '/admin/predictions', icon: Activity },
    { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
    { name: 'Dataset', href: '/admin/dataset', icon: Database },
    { name: 'Region Insights', href: '/admin/insights', icon: MapPin },
    { name: 'Alerts', href: '/admin/alerts', icon: BellRing },
    { name: 'Content', href: '/admin/content', icon: Languages },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[272px]
        bg-gradient-to-b from-surface-950 via-surface-900 to-surface-950
        shadow-2xl transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:inset-0
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-surface-950 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">AgriSmart</span>
              <span className="block text-[10px] text-amber-400 font-semibold uppercase tracking-widest">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin info */}
        {profile && (
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile.full_name || 'Admin'}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                  <Shield className="h-3 w-3" /> Administrator
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Back to App */}
        <div className="px-4 pt-4">
          <NavLink
            to="/app/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 text-surface-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-2 px-4 overflow-y-auto">
          <p className="px-4 mb-3 mt-4 text-[10px] font-bold text-surface-500 uppercase tracking-[0.15em]">
            Administration
          </p>
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href ||
                (item.href === '/admin' && location.pathname === '/admin');

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    sidebar-item group
                    ${isActive ? 'active !from-amber-600/90 !to-amber-500/90' : ''}
                  `}
                >
                  <Icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 opacity-60" />}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 m-4 mt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
