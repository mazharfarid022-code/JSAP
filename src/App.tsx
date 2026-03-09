import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from './store/auth';
import './i18n';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import AddItem from './pages/admin/AddItem';
import AddWork from './pages/admin/AddWork';
import AddPayment from './pages/admin/AddPayment';
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerProfile from './pages/worker/Profile';
import WorkerPayments from './pages/worker/Payments';
import Layout from './components/Layout';

export default function App() {
  const { user, isAdmin, setUser, setIsAdmin } = useAuthStore();

  useEffect(() => {
    // Check if admin based on custom logic or metadata
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(storedIsAdmin);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsAdmin]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user && !isAdmin ? <Login /> : <Navigate to={isAdmin ? "/admin" : "/worker"} />} />
        <Route path="/signup" element={!user && !isAdmin ? <Signup /> : <Navigate to={isAdmin ? "/admin" : "/worker"} />} />
        
        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/add-item" element={isAdmin ? <AddItem /> : <Navigate to="/login" />} />
          <Route path="/admin/add-work" element={isAdmin ? <AddWork /> : <Navigate to="/login" />} />
          <Route path="/admin/add-payment" element={isAdmin ? <AddPayment /> : <Navigate to="/login" />} />
          <Route path="/worker" element={user && !isAdmin ? <WorkerDashboard /> : <Navigate to="/login" />} />
          <Route path="/worker/profile" element={user && !isAdmin ? <WorkerProfile /> : <Navigate to="/login" />} />
          <Route path="/worker/payments" element={user && !isAdmin ? <WorkerPayments /> : <Navigate to="/login" />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
