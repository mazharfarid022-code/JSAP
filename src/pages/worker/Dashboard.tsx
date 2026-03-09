import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Activity, DollarSign, Download, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export default function WorkerDashboard() {
  const { user } = useAuthStore();
  const [workerData, setWorkerData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalReceived: 0,
    remainingBalance: 0
  });

  useEffect(() => {
    if (user) {
      fetchWorkerData();
    }
  }, [user]);

  const fetchWorkerData = async () => {
    if (!user?.uid) return;
    
    const docRef = doc(db, 'workers', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setWorkerData(docSnap.data());
    }

    // Fetch stats
    const workQuery = query(collection(db, 'work_records'), where('worker_id', '==', user.uid));
    const workSnap = await getDocs(workQuery);
    const earned = workSnap.docs.reduce((sum, doc) => sum + Number(doc.data().total_earned || 0), 0);
    
    const paymentQuery = query(collection(db, 'payments'), where('worker_id', '==', user.uid));
    const paymentSnap = await getDocs(paymentQuery);
    const received = paymentSnap.docs.reduce((sum, doc) => sum + Number(doc.data().received_payment || 0), 0);

    setStats({
      totalEarned: earned,
      totalReceived: received,
      remainingBalance: earned - received
    });
  };

  const downloadStatement = async () => {
    // This would call the backend API to generate and send PDF
    try {
      const response = await fetch('/api/receipts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker: workerData,
          eventType: 'Statement Download',
          receiptId: `STMT-${Date.now()}`
        })
      });
      
      if (response.ok) {
        alert('Statement sent to your email!');
      } else {
        alert('Failed to send statement.');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending statement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brown-900">Welcome, {workerData?.name || 'Worker'}</h1>
          <p className="text-brown-500">Worker ID: {workerData?.worker_id || 'N/A'}</p>
        </div>
        <button 
          onClick={downloadStatement}
          className="flex items-center gap-2 px-4 py-2 bg-brown-900 text-white rounded-lg text-sm font-medium hover:bg-brown-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Statement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-brown-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-brown-500 p-3 rounded-lg text-white">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-brown-500">Total Earned</p>
              <p className="text-2xl font-bold text-brown-900">Rs. {stats.totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-brown-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-brown-500 p-3 rounded-lg text-white">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-brown-500">Payment Received</p>
              <p className="text-2xl font-bold text-brown-900">Rs. {stats.totalReceived.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-brown-100 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-brown-600 p-3 rounded-lg text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-brown-500">Remaining Balance</p>
              <p className="text-2xl font-bold text-brown-900">Rs. {stats.remainingBalance.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6 mt-8">
        <h2 className="text-lg font-semibold text-brown-900 mb-4">Running Laat (Production Batch)</h2>
        <div className="text-center py-12 text-brown-500">
          You have no active production batches currently.
        </div>
      </div>
    </div>
  );
}
