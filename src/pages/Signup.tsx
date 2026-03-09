import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { PROFESSIONS } from '../constants';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    city: '',
    mobile: '',
    cnic: '',
    age: '',
    gender: 'Male',
    dob: '',
    email: '',
    password: '',
    profession: PROFESSIONS[0],
    workerId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Sign up with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Insert into workers collection
      await setDoc(doc(db, 'workers', user.uid), {
        id: user.uid,
        name: formData.name,
        father_name: formData.fatherName,
        city: formData.city,
        mobile: formData.mobile,
        cnic: formData.cnic,
        age: parseInt(formData.age),
        gender: formData.gender,
        dob: formData.dob,
        email: formData.email,
        profession: formData.profession,
        worker_id: formData.workerId || formData.cnic, // Fallback to CNIC if empty
        status: 'active',
        created_at: new Date().toISOString()
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brown-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brown-100 mb-4">
            <svg className="h-6 w-6 text-brown-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brown-900 mb-2">Registration Successful!</h2>
          <p className="text-brown-600 mb-6">
            Please check your email to verify your account before logging in.
          </p>
          <Link
            to="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brown-900 hover:bg-brown-800 transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-brown-900">Worker Registration</h2>
          <p className="mt-2 text-brown-600">Join JS APPARELS</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-brown-100"
        >
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-brown-700">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brown-700">Father's Name</label>
                <input type="text" name="fatherName" required value={formData.fatherName} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
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
                <label className="block text-sm font-medium text-brown-700">Worker ID (Optional)</label>
                <input type="text" name="workerId" value={formData.workerId} onChange={handleChange} placeholder="Defaults to CNIC" className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
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

              <div>
                <label className="block text-sm font-medium text-brown-700">Profession</label>
                <select name="profession" value={formData.profession} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm">
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <hr className="my-4 border-brown-200" />
                <h3 className="text-lg font-medium text-brown-900 mb-4">Account Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700">Password</label>
                <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-brown-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brown-600 focus:border-brown-600 sm:text-sm" />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link to="/login" className="text-sm font-medium text-brown-700 hover:text-brown-600">
                Already have an account? Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brown-900 hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-900 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
