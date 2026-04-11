import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  History,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendario' },
  { to: '/history', icon: History, label: 'Historial' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
  { to: '/colors', icon: Palette, label: 'Colores' },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 h-full bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border-color)]',
        'flex flex-col z-40'
      )}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--sidebar-border-color)]">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold text-[var(--text-primary)]"
            >
              Life OS
            </motion.span>
          )}
        </AnimatePresence>
        <motion.button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-xl hover:bg-[var(--sidebar-hover-bg)]',
            isCollapsed && 'mx-auto'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="collapsed"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <motion.li
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover-bg)]',
                    isActive && 'bg-[var(--sidebar-active-bg)] text-[var(--text-primary)] font-medium',
                    isCollapsed && 'justify-center'
                  )
                }
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                </motion.div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-[var(--sidebar-border-color)] p-3">
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl',
              'hover:bg-[var(--sidebar-hover-bg)]',
              isCollapsed && 'justify-center'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 text-left overflow-hidden"
                >
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">
                    {user?.email || ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {showUserMenu && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 w-full mb-2 bg-[var(--sidebar-active-bg)] rounded-xl shadow-lg border border-[var(--sidebar-border-color)] overflow-hidden"
              >
                <motion.button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover-bg)] transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}