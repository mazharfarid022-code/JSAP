import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export default function AddPayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [workers, setWorkers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    workerId: '',
    totalPayment: '',
    receivedPayment: '',
  });

  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const workersSnap = await getDocs(collection(db, 'workers'));
    setWorkers(workersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleWorkerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wId = e.target.value;
    setFormData({ ...formData, workerId: wId });
    const worker = workers.find(w => w.id === wId);
    setSelectedWorker(worker);

    // Fetch total earned for this worker
    if (worker) {
      const workQuery = query(collection(db, 'work_records'), where('worker_id', '==', worker.id));
      const workSnap = await getDocs(workQuery);
      
      const totalEarned = workSnap.docs.reduce((sum, doc) => sum + Number(doc.data().total_earned || 0), 0);
      
      const paymentQuery = query(collection(db, 'payments'), where('worker_id', '==', worker.id));
      const paymentSnap = await getDocs(paymentQuery);
        
      const totalReceived = paymentSnap.docs.reduce((sum, doc) => sum + Number(doc.data().received_payment || 0), 0);

      setFormData(prev => ({
        ...prev,
        totalPayment: totalEarned.toString(),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    setLoading(true);
    setError('');

    const total = parseFloat(formData.totalPayment);
    const received = parseFloat(formData.receivedPayment);
    const remaining = total - received;

    try {
      await addDoc(collection(db, 'payments'), {
        worker_id: selectedWorker.id,
        total_payment: total,
        received_payment: received,
        remaining_payment: remaining,
        created_at: new Date().toISOString()
      });

      // Send Email Receipt
      await fetch('/api/receipts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker: selectedWorker,
          eventType: 'Payment Received',
          payment: {
            total_payment: total,
            received_payment: received,
            remaining_payment: remaining
          },
          receiptId: `PAY-${Date.now()}`
        })
      });
      
      alert('Payment recorded successfully!');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-brown-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-brown-900">Add Payment</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-brown-700">Select Worker</label>
              <select required value={formData.workerId} onChange={handleWorkerChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm">
                <option value="" disabled>Select a worker...</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.worker_id})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Total Payment (Rs.)</label>
              <input type="number" step="0.01" required value={formData.totalPayment} onChange={(e) => setFormData({...formData, totalPayment: e.target.value})} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm bg-brown-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Received Payment (Rs.)</label>
              <input type="number" step="0.01" required value={formData.receivedPayment} onChange={(e) => setFormData({...formData, receivedPayment: e.target.value})} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            {formData.totalPayment && formData.receivedPayment && (
              <div className="bg-brown-50 p-4 rounded-lg border border-brown-200">
                <p className="text-sm font-medium text-brown-700">Remaining Balance:</p>
                <p className="text-2xl font-bold text-brown-900">
                  Rs. {(parseFloat(formData.totalPayment) - parseFloat(formData.receivedPayment)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brown-900 hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-900 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
