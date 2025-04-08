'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
          router.push('/images');
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
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-[#003DA5] py-6 px-6 text-center relative">
                {/* KoC Logo/emblem */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white rounded-full p-3 shadow-md">
                    <div className="text-[#003DA5] flex items-center justify-center h-full">
                      <Shield className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-medium text-white">Knights of Columbus</h2>
                <p className="text-blue-100 text-sm mt-1">Arvada Council #12395 Photo Sharing</p>
                
                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD100]"></div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="p-3 mx-6 mt-4 mb-0 bg-[#D80000]/10 text-[#D80000] text-sm rounded-md">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
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
                        className="h-4 w-4 text-[#003DA5] focus:ring-[#003DA5] border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-[#003DA5] hover:text-[#002966]">
                      Forgot password?
                    </Link>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#003DA5] text-white py-2 px-4 rounded-md hover:bg-[#002966] focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:ring-offset-2 transition-colors flex items-center justify-center"
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
                <Link href="/register" className="text-[#003DA5] hover:text-[#002966] font-medium">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
    );
}