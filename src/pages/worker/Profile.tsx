import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { ArrowLeft, User, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WorkerProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    city: '',
    mobile: '',
    cnic: '',
    age: '',
    gender: 'Male',
    dob: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.uid) return;
    const docRef = doc(db, 'workers', user.uid);
    const docSnap = await getDoc(docRef);
      
    if (docSnap.exists()) {
      const data = docSnap.data();
      setFormData({
        name: data.name || '',
        father_name: data.father_name || '',
        city: data.city || '',
        mobile: data.mobile || '',
        cnic: data.cnic || '',
        age: data.age?.toString() || '',
        gender: data.gender || 'Male',
        dob: data.dob || '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user?.uid) throw new Error('No user found');
      
      const docRef = doc(db, 'workers', user.uid);
      await updateDoc(docRef, {
        name: formData.name,
        father_name: formData.father_name,
        city: formData.city,
        mobile: formData.mobile,
        cnic: formData.cnic,
        age: parseInt(formData.age),
        gender: formData.gender,
        dob: formData.dob,
      });
      
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        if (!user?.uid) return;
        
        // Delete from Firestore
        await deleteDoc(doc(db, 'workers', user.uid));
        
        // Delete Firebase Auth user
        if (auth.currentUser) {
          await deleteUser(auth.currentUser);
        }
        
        logout();
        navigate('/login');
      } catch (err: any) {
        setError(err.message || 'Failed to delete profile');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/worker')} className="p-2 hover:bg-brown-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-brown-900">My Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown-100 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-brown-50 border-l-4 border-brown-500 p-4 rounded-md">
            <p className="text-sm text-brown-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-brown-200 rounded-full flex items-center justify-center text-brown-400">
              <User className="w-12 h-12" />
            </div>
            <div>
              <button type="button" className="px-4 py-2 bg-white border border-brown-300 rounded-lg text-sm font-medium text-brown-700 hover:bg-brown-50">
                Change Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-brown-700">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brown-700">Father's Name</label>
              <input type="text" name="father_name" required value={formData.father_name} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">City</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Mobile Number</label>
              <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">CNIC</label>
              <input type="text" name="cnic" required value={formData.cnic} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Age</label>
              <input type="number" name="age" required value={formData.age} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700">Date of Birth</label>
              <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-brown-200">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brown-900 hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-900 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
