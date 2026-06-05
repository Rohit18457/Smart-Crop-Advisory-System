import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search, Shield, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../Common/LanguageSwitcher';

const Header = ({ onMenuClick }) => {
  const { profile, isAdmin } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-surface-200/60 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 h-[72px]">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-btn"
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3.5 h-4 w-4 text-surface-400" />
            <input
              id="header-search"
              type="text"
              placeholder="Search crops, diseases, prices..."
              className="w-80 pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm
                placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
                transition-all duration-200"
            />
            <kbd className="absolute right-3 text-[10px] text-surface-400 font-mono bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Dark Mode Toggle */}
          <button
            id="dark-mode-toggle"
            onClick={() => setDark(d => !d)}
            className="p-2.5 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-all"
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          {/* Notifications */}
          <button 
            id="notifications-btn"
            className="relative p-2.5 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-all"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-surface-200 mx-1" />

          {/* User Profile — clickable to /app/profile */}
          <Link to="/app/profile" id="user-profile-btn" className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm text-white font-bold text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-surface-900 leading-none">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-1">
                {isAdmin ? (
                  <><Shield className="h-3 w-3 text-amber-500" /> Admin</>
                ) : (
                  <><User className="h-3 w-3" /> Farmer</>
                )}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;