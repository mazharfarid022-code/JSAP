import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Filter, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

export default function WorkerPayments() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, week, month
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalReceived: 0,
    remainingBalance: 0
  });
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user, filter]);

  const fetchPayments = async () => {
    if (!user?.uid) return;

    // Fetch work records for earnings
    const workQuery = query(collection(db, 'work_records'), where('worker_id', '==', user.uid));
    const workSnap = await getDocs(workQuery);
    
    // Fetch payments
    const paymentQuery = query(collection(db, 'payments'), where('worker_id', '==', user.uid));
    const paymentSnap = await getDocs(paymentQuery);

    let filteredWork: any[] = workSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let filteredPayments: any[] = paymentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    if (filter === 'week') {
      const start = startOfWeek(now);
      filteredWork = filteredWork.filter(w => new Date(w.created_at) >= start);
      filteredPayments = filteredPayments.filter(p => new Date(p.created_at) >= start);
    } else if (filter === 'month') {
      const start = startOfMonth(now);
      filteredWork = filteredWork.filter(w => new Date(w.created_at) >= start);
      filteredPayments = filteredPayments.filter(p => new Date(p.created_at) >= start);
    }

    const earned = filteredWork.reduce((sum, w) => sum + Number(w.total_earned || 0), 0);
    const received = filteredPayments.reduce((sum, p) => sum + Number(p.received_payment || 0), 0);

    setStats({
      totalEarned: earned,
      totalReceived: received,
      remainingBalance: earned - received
    });

    // Sort payments by date descending
    filteredPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setPayments(filteredPayments);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/worker')} className="p-2 hover:bg-brown-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-brown-900">Payment Statistics</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-brown-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-brown-600 focus:border-brown-600"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
          <p className="text-sm font-medium text-brown-500">Total Earned</p>
          <p className="text-3xl font-bold text-brown-900 mt-2">Rs. {stats.totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
          <p className="text-sm font-medium text-brown-500">Total Received</p>
          <p className="text-3xl font-bold text-brown-600 mt-2">Rs. {stats.totalReceived.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
          <p className="text-sm font-medium text-brown-500">Remaining Balance</p>
          <p className="text-3xl font-bold text-brown-700 mt-2">Rs. {stats.remainingBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-brown-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-brown-900">Payment History</h2>
          <button className="flex items-center gap-2 text-sm text-brown-700 font-medium hover:text-brown-800">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brown-50 text-brown-500 text-sm">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Total Payment</th>
                <th className="px-6 py-3 font-medium">Received</th>
                <th className="px-6 py-3 font-medium">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-brown-500">
                    No payment records found for this period.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-brown-50">
                    <td className="px-6 py-4 text-sm text-brown-900">
                      {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-brown-900">Rs. {payment.total_payment}</td>
                    <td className="px-6 py-4 text-sm text-brown-600 font-medium">Rs. {payment.received_payment}</td>
                    <td className="px-6 py-4 text-sm text-brown-700">Rs. {payment.remaining_payment}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
