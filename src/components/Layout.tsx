import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, Menu, User, Settings, FileText, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('isAdmin');
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ur' : 'en');
  };

  return (
    <div className="min-h-screen bg-brown-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-brown-900 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brown-600 rounded-lg flex items-center justify-center font-bold text-xl">
                JS
              </div>
              <span className="font-semibold text-xl tracking-tight">JS APPARELS</span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleLanguage}
                className="px-3 py-1 rounded border border-brown-700 hover:bg-brown-800 text-sm font-medium transition-colors"
              >
                {i18n.language === 'en' ? 'اردو' : 'EN'}
              </button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-brown-800 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-xl border border-brown-200 overflow-hidden z-40"
          >
            <div className="p-4 border-b border-brown-100">
              <p className="font-medium text-brown-900">{isAdmin ? 'Admin' : user?.email}</p>
              <p className="text-sm text-brown-500">{isAdmin ? 'Administrator' : 'Worker'}</p>
            </div>
            
            <div className="py-2">
              <button 
                onClick={() => { navigate(isAdmin ? '/admin' : '/worker'); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-brown-700 hover:bg-brown-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>{t('dashboard')}</span>
              </button>
              
              {!isAdmin && (
                <>
                  <button 
                    onClick={() => { navigate('/worker/profile'); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-brown-700 hover:bg-brown-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => { navigate('/worker/payments'); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-brown-700 hover:bg-brown-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Payment Statistics</span>
                  </button>
                </>
              )}
              
              {isAdmin && (
                <button 
                  onClick={() => { navigate('/admin/settings'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-brown-700 hover:bg-brown-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              )}
            </div>
            
            <div className="p-2 border-t border-brown-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
