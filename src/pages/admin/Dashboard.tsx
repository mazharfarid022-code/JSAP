import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Package, Activity, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalItems: 0,
    runningLaat: 0,
    completedLaat: 0,
    totalProduction: 0,
    totalPayments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const workersSnap = await getDocs(collection(db, 'workers'));
    const itemsSnap = await getDocs(collection(db, 'items'));
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    
    const totalPayments = paymentsSnap.docs.reduce((sum, doc) => sum + Number(doc.data().received_payment || 0), 0);

    setStats({
      totalWorkers: workersSnap.size,
      totalItems: itemsSnap.size,
      runningLaat: 0, // Mock data for now
      completedLaat: 0,
      totalProduction: 0,
      totalPayments: totalPayments
    });
  };

  const statCards = [
    { title: 'Total Workers', value: stats.totalWorkers, icon: Users, color: 'bg-brown-500' },
    { title: 'Total Items', value: stats.totalItems, icon: Package, color: 'bg-brown-500' },
    { title: 'Running Laat', value: stats.runningLaat, icon: Activity, color: 'bg-brown-600' },
    { title: 'Total Payments', value: `Rs. ${stats.totalPayments}`, icon: DollarSign, color: 'bg-brown-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brown-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/add-item')} className="px-4 py-2 bg-brown-900 text-white rounded-lg text-sm font-medium hover:bg-brown-800 transition-colors">
            Add Item
          </button>
          <button onClick={() => navigate('/admin/add-work')} className="px-4 py-2 bg-brown-600 text-white rounded-lg text-sm font-medium hover:bg-brown-700 transition-colors">
            Add Work
          </button>
          <button onClick={() => navigate('/admin/add-payment')} className="px-4 py-2 bg-brown-600 text-white rounded-lg text-sm font-medium hover:bg-brown-700 transition-colors">
            Add Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-brown-100 p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-brown-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
          <h2 className="text-lg font-semibold text-brown-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-brown-500">
            No recent activity found.
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
          <h2 className="text-lg font-semibold text-brown-900 mb-4">Running Laats</h2>
          <div className="text-center py-8 text-brown-500">
            No active production batches.
          </div>
        </div>
      </div>
    </div>
  );
}
