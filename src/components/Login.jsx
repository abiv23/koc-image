'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginComponent() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });
          
          if (result?.error) {
            setError('Invalid email or password');
            return;
          }
          
          // Redirect on success
          router.push('/upload');
          router.refresh();
        } catch (error) {
          console.error('Login failed:', error);
          setError('An unexpected error occurred');
        } finally {
          setIsLoading(false);
        }
      };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-violet-600 py-4 px-6">
                <h2 className="text-xl font-medium text-white">Sign In</h2>
                <p className="text-violet-200 text-sm mt-1">Welcome back to PhotoShare</p>
            </div>
            {/* Error Message */}
            {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>
            )}
            {/* Form */}    
            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                    </label>
                    <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                    />
                </div>
                
                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                    </label>
                    <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>
                
                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                    <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                    </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-violet-600 hover:text-violet-500">
                        Forgot password?
                    </Link>
                </div>
                
                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                >
                    {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ) : (
                    <>
                        Sign In <ArrowRight size={16} className="ml-2" />
                    </>
                    )}
                </button>
                </div>
            </form>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-center">
                Don't have an account?{' '}
                <Link href="/register" className="text-violet-600 hover:text-violet-500 font-medium">
                Sign up
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
}