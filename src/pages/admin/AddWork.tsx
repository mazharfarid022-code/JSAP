import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export default function AddWork() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [workers, setWorkers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    workerId: '',
    itemId: '',
    totalItemsStitched: '',
  });

  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const workersSnap = await getDocs(collection(db, 'workers'));
    const itemsSnap = await getDocs(collection(db, 'items'));
    
    setWorkers(workersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setItems(itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wId = e.target.value;
    setFormData({ ...formData, workerId: wId });
    setSelectedWorker(workers.find(w => w.id === wId));
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iId = e.target.value;
    setFormData({ ...formData, itemId: iId });
    setSelectedItem(items.find(i => i.id === iId));
  };

  const getPriceForWorker = () => {
    if (!selectedWorker || !selectedItem || !selectedItem.prices) return 0;
    return selectedItem.prices[selectedWorker.profession] || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || !selectedItem) return;

    const pricePerPiece = getPriceForWorker();
    if (pricePerPiece === 0) {
      setError(`No price defined for profession: ${selectedWorker.profession} on this Laat.`);
      return;
    }

    setLoading(true);
    setError('');

    const totalStitched = parseInt(formData.totalItemsStitched);
    const totalEarned = totalStitched * pricePerPiece;

    try {
      await addDoc(collection(db, 'work_records'), {
        worker_id: selectedWorker.id,
        item_id: selectedItem.id,
        total_items_stitched: totalStitched,
        total_earned: totalEarned,
        created_at: new Date().toISOString()
      });

      // Send Email Receipt
      await fetch('/api/receipts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker: selectedWorker,
          eventType: 'Laat Completed',
          laat: {
            laat_number: selectedItem.laat_number,
            label: selectedItem.label,
            piece_size: selectedItem.piece_size,
            price_per_piece: pricePerPiece,
            total_items_stitched: totalStitched,
            total_earned: totalEarned
          },
          receiptId: `WRK-${Date.now()}`
        })
      });
      
      alert('Work recorded successfully!');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to record work');
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
        <h1 className="text-2xl font-bold text-brown-900">Add Work Record</h1>
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
                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.profession})</option>)}
              </select>
              {selectedWorker && (
                <p className="mt-2 text-sm text-brown-500">Profession: {selectedWorker.profession} | Mobile: {selectedWorker.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Select Item (Laat)</label>
              <select required value={formData.itemId} onChange={handleItemChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm">
                <option value="" disabled>Select an item...</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.laat_number} - {i.label}</option>)}
              </select>
              {selectedItem && selectedWorker && (
                <p className="mt-2 text-sm text-brown-500">
                  Price for {selectedWorker.profession}: Rs. {getPriceForWorker()} | Size: {selectedItem.piece_size}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Total Items Stitched</label>
              <input type="number" required value={formData.totalItemsStitched} onChange={(e) => setFormData({...formData, totalItemsStitched: e.target.value})} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            {selectedItem && selectedWorker && formData.totalItemsStitched && (
              <div className="bg-brown-50 p-4 rounded-lg border border-brown-200">
                <p className="text-sm font-medium text-brown-700">Calculated Earning:</p>
                <p className="text-2xl font-bold text-brown-900">
                  Rs. {(parseInt(formData.totalItemsStitched) * getPriceForWorker()).toFixed(2)}
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
              {loading ? 'Saving...' : 'Save Work Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
