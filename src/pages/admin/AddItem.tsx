import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { PROFESSIONS } from '../../constants';

const LABELS = ['Disney Kids', 'Little Junior', 'Smart Clothing'];

export default function AddItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    laatNumber: '',
    pieceSize: '',
    label: LABELS[0],
  });

  // State for prices per profession
  const [prices, setPrices] = useState<Record<string, string>>(
    PROFESSIONS.reduce((acc, prof) => ({ ...acc, [prof]: '' }), {})
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePriceChange = (profession: string, value: string) => {
    setPrices({ ...prices, [profession]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert prices to numbers, default to 0 if empty
    const numericPrices = Object.entries(prices).reduce((acc, [prof, val]) => {
      acc[prof] = val ? parseFloat(val as string) : 0;
      return acc;
    }, {} as Record<string, number>);

    try {
      await addDoc(collection(db, 'items'), {
        laat_number: formData.laatNumber,
        piece_size: formData.pieceSize,
        label: formData.label,
        prices: numericPrices,
        images: [],
        created_at: new Date().toISOString()
      });
      
      alert('Item added successfully!');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-brown-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-brown-900">Add New Item (Laat)</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-brown-700">Laat Number</label>
              <input type="text" name="laatNumber" required value={formData.laatNumber} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Piece Size (16-40)</label>
              <input type="text" name="pieceSize" required value={formData.pieceSize} onChange={handleChange} placeholder="e.g. 16-20" className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Label</label>
              <select name="label" value={formData.label} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm">
                {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-brown-200 pt-6">
            <h3 className="text-lg font-medium text-brown-900 mb-4">Prices per Profession (Rs.)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROFESSIONS.map((prof) => (
                <div key={prof} className="bg-brown-50 p-3 rounded-lg border border-brown-200">
                  <label className="block text-sm font-medium text-brown-700 mb-1">{prof}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={prices[prof]} 
                    onChange={(e) => handlePriceChange(prof, e.target.value)} 
                    placeholder="0.00"
                    className="block w-full border border-brown-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brown-900 hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-900 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
