import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { LogIn, User, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAdmin, setUser } = useAuthStore();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Admin Login Logic (Hidden)
      if (identifier.toLowerCase() === 'js-admin' && password === '76791276') {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        // We still need a valid session, let's mock it or use a special admin account if exists
        // For this demo, we'll just set the state and navigate
        setUser({ uid: 'admin', email: 'admin@jsapparels.com' } as any);
        navigate('/admin');
        return;
      }

      // Worker Login Logic
      // Check if identifier is email, CNIC, or Worker ID
      let emailToUse = identifier;
      
      if (!identifier.includes('@')) {
        // Look up worker email by CNIC or Worker ID
        const workersRef = collection(db, 'workers');
        const q1 = query(workersRef, where('cnic', '==', identifier));
        const q2 = query(workersRef, where('worker_id', '==', identifier));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        let workerDoc = null;
        if (!snap1.empty) {
          workerDoc = snap1.docs[0];
        } else if (!snap2.empty) {
          workerDoc = snap2.docs[0];
        }
          
        if (!workerDoc) {
          throw new Error('Invalid credentials');
        }
        emailToUse = workerDoc.data().email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);

      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      navigate('/worker');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brown-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 bg-brown-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg">
            JS
          </div>
        </motion.div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-brown-900 tracking-tight">
          JS APPARELS
        </h2>
        <p className="mt-2 text-center text-sm text-brown-600">
          Worker Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-brown-100"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-brown-700">
                Email / Worker ID / CNIC
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brown-400" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="focus:ring-brown-600 focus:border-brown-600 block w-full pl-10 sm:text-sm border-brown-300 rounded-lg py-3 border bg-brown-50"
                  placeholder="Enter your ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brown-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-brown-600 focus:border-brown-600 block w-full pl-10 sm:text-sm border-brown-300 rounded-lg py-3 border bg-brown-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-brown-700 hover:text-brown-600">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brown-900 hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-900 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brown-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-brown-500">New worker?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-3 px-4 border border-brown-300 rounded-lg shadow-sm text-sm font-medium text-brown-700 bg-white hover:bg-brown-50 transition-colors"
              >
                Register Account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
