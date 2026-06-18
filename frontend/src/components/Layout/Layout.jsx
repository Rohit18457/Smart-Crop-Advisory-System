import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-50 relative overflow-hidden font-sans">
      {/* ──── Animated Background Blobs ──── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-300/20 rounded-full blur-[100px] mix-blend-multiply animate-blob pointer-events-none z-0" />
      <div className="absolute top-40 left-20 w-[400px] h-[400px] bg-accent-300/20 rounded-full blur-[100px] mix-blend-multiply animate-blob pointer-events-none z-0" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[120px] mix-blend-multiply animate-blob pointer-events-none z-0" style={{ animationDelay: '4s' }} />

      {/* Sidebar */}
      <div className="z-20 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;