'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`,
        { user: formData }
      );

      const { token, user } = response.data;

      // SECURITY BLOCK //
      if (user.role === 'admin' || user.role === 'audiologist') {
        setError(
          <span>
            Staff accounts must log in via the{' '}
            <a 
              href="http://localhost:3000/users/sign_in" 
              className="underline font-bold hover:text-red-700"
            >
              Doctor Portal
            </a>.
          </span>
        );
        return;
      }

      // ONLY PATIENT //
      Cookies.set('token', token, { expires: 1 });
      Cookies.set('user_role', user.role, { expires: 1 });
      
      router.push('/dashboard');

    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* HEADER */}
        <div className="bg-gray-800 p-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">UYARIY</h1>
          <p className="text-gray-300 mt-2 text-sm">Patient Portal Access</p>
        </div>

        <div className="p-8 pt-10">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">Welcome Back</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-gray-800 focus:bg-white outline-none transition"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-gray-800 focus:bg-white outline-none transition"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Do not have an account?{' '}
              <Link href="/register" className="text-gray-800 font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}