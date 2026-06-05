import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Sprout, Bug, CloudSun, TrendingUp, Mic,
  X, Leaf, ChevronRight, LogOut, User, Shield
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout, isAdmin } = useAuth();

  const navigation = [
    { name: t('dashboard'), href: '/app/dashboard', icon: LayoutDashboard },
    { name: t('cropRecommendation'), href: '/app/crop-recommendation', icon: Sprout },
    { name: t('diseaseDetection'), href: '/app/disease-detection', icon: Bug },
    { name: t('weather'), href: '/app/weather', icon: CloudSun },
    { name: t('marketPrices'), href: '/app/market-prices', icon: TrendingUp },
    { name: t('voiceAssistant'), href: '/app/voice-assistant', icon: Mic },
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[272px]
        bg-gradient-to-b from-surface-900 via-surface-900 to-surface-950
        shadow-2xl transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:inset-0
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface-900 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">AgriSmart</span>
              <span className="block text-[10px] text-primary-400 font-medium uppercase tracking-widest">AI Platform</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        {profile && (
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile.full_name || 'User'}</p>
                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary-400 uppercase tracking-wider">
                      <User className="h-3 w-3" /> Farmer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-4 overflow-y-auto">
          <p className="px-4 mb-3 text-[10px] font-bold text-surface-500 uppercase tracking-[0.15em]">
            Main Menu
          </p>
          <div className="space-y-1">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href === '/app/dashboard' && location.pathname === '/app');
              
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    sidebar-item group
                    ${isActive ? 'active' : ''}
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Admin link */}
          {isAdmin && (
            <>
              <p className="px-4 mb-3 mt-6 text-[10px] font-bold text-surface-500 uppercase tracking-[0.15em]">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={`sidebar-item group ${location.pathname.startsWith('/admin') ? 'active !from-amber-600/90 !to-amber-500/90' : ''}`}
              >
                <Shield className="h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="flex-1">Admin Panel</span>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout button */}
        <div className="p-4 m-4 mt-2 space-y-3">
          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
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

export default Sidebar;