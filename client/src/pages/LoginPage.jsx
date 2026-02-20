import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await login(formData.email, formData.password);
        if (success) {
            // Get user from store to check role
            const userState = useAuthStore.getState();
            const userRole = userState.user?.role;

            // Navigate based on role
            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'builder') {
                navigate('/builder/dashboard');
            } else if (userRole === 'crm_manager' || userRole === 'sales_associate') {
                navigate('/crm/dashboard');
            } else if (userRole === 'project_advocate' || userRole === 'brand_advocate') {
                navigate('/advocate/dashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">BuiltCred</h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    Don't have an account?{' '}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Register here
                    </a>
                </p>
            </div>
        </div>
    );
};
