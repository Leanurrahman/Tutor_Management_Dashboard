import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  LogOut, 
  Menu, 
  PanelLeft, 
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', path: '/students', icon: Users },
  { name: 'Classes', path: '/classes', icon: BookOpen },
  { name: 'Payments', path: '/payments', icon: CreditCard },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative z-40 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        {/* Sidebar Header - Always show logo, text only when expanded */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Always visible logo */}
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap size={20} className="text-white" />
            </div>
            {/* Text only when expanded */}
            <span className={`font-bold text-slate-800 whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 hidden lg:block'}`}>
              Bright Student Pro
            </span>
          </div>
          
          {/* Collapse button for desktop */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          >
            <PanelLeft size={18} />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                  ${!isSidebarExpanded && 'lg:justify-center lg:px-2'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-900'} />
                <span className={`whitespace-nowrap transition-all duration-300 ${!isSidebarExpanded && 'lg:hidden'}`}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${!isSidebarExpanded && 'lg:justify-center'}`}>
            <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
              <AvatarImage src={currentUser?.photoURL || ''} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-bold">
                {currentUser?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${!isSidebarExpanded && 'lg:hidden'}`}>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {currentUser?.displayName || currentUser?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50 mt-2 text-xs px-2 ${!isSidebarExpanded && 'lg:justify-center lg:px-0'}`}
            onClick={logout}
          >
            <LogOut size={18} />
            <span className={`ml-2 ${!isSidebarExpanded && 'lg:hidden'}`}>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-slate-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </Button>
            
            {/* Page title */}
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.name || 'Overview'}
            </h2>
          </div>
          
          {/* Quick action button */}
          <Button 
            variant="default" 
            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm rounded-lg text-sm font-medium px-4 h-9"
          >
            + Quick Record
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}