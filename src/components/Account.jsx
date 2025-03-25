'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Key, Camera, Save, Edit, Trash, X, Check } from 'lucide-react';

const Account = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Load user data when session is available
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }));
      setLoading(false);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when typing
    if (Object.keys(error).includes(name)) {
      setError(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '' };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (changePassword) {
      if (!formData.currentPassword) {
        newErrors.password = 'Current password is required';
        isValid = false;
      } else if (!formData.newPassword) {
        newErrors.password = 'New password is required';
        isValid = false;
      } else if (formData.newPassword.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.password = 'Passwords do not match';
        isValid = false;
      }
    }
    
    setError(newErrors);
    return isValid;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // In a real app, this would call your API to update the user's profile
      // For now, we'll just simulate a delay and update the session
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update session data (this is a simplification)
      await update({
        name: formData.name,
      });
      
      // Reset password fields and exit edit mode
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setEditMode(false);
      setChangePassword(false);
      
      // In a real app, you'd handle password change separately
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(prev => ({
        ...prev,
        general: 'Failed to update profile. Please try again.'
      }));
    } finally {
      setSaving(false);
    }
  };
  
  const cancelEdit = () => {
    // Reset form data to session values
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
    
    setEditMode(false);
    setChangePassword(false);
    setError({ name: '', email: '', password: '' });
  };
  
  // For account deletion functionality
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleDeleteAccount = async () => {
    // In a real app, this would call your API to delete the user's account
    alert('This would delete your account in a real application');
  };
  
  if (loading) {
    return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
    </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
            {!editMode ? (
                <button 
                onClick={() => setEditMode(true)}
                className="flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                <Edit size={16} className="mr-1" />
                Edit
                </button>
            ) : (
                <button 
                onClick={cancelEdit}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                <X size={16} className="mr-1" />
                Cancel
                </button>
            )}
            </div>
            
            <div className="space-y-4">
            {/* Profile picture - static for now */}
            <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-violet-100 rounded-full flex items-center justify-center">
                <User className="text-violet-600" size={32} />
                </div>
                {editMode && (
                <button className="text-sm text-violet-600 hover:text-violet-700">
                    Change profile picture
                </button>
                )}
            </div>
            
            {/* Name input */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
                </label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={18} />
                </div>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full pl-10 pr-4 py-2 border ${
                    error.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    !editMode ? 'bg-gray-50' : 'bg-white'
                    }`}
                />
                </div>
                {error.name && <p className="mt-1 text-sm text-red-600">{error.name}</p>}
            </div>
            
            {/* Email input */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
                </label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                </div>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true} // Email changes typically require verification
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email address cannot be changed directly for security reasons.</p>
            </div>
            </div>
        </div>
        
        {/* Password Section - Only shown in edit mode */}
        {editMode && (
            <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Password</h2>
                {!changePassword ? (
                <button 
                    onClick={() => setChangePassword(true)}
                    className="flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                    <Key size={16} className="mr-1" />
                    Change Password
                </button>
                ) : (
                <button 
                    onClick={() => setChangePassword(false)}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                    <X size={16} className="mr-1" />
                    Cancel
                </button>
                )}
            </div>
            
            {changePassword && (
                <div className="space-y-4">
                {/* Current Password */}
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                    </label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="text-gray-400" size={18} />
                    </div>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border ${
                        error.password ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    />
                    </div>
                </div>
                
                {/* New Password */}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                    </label>
                    <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                        error.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    />
                </div>
                
                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                    </label>
                    <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                        error.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    />
                </div>
                
                {error.password && <p className="text-sm text-red-600">{error.password}</p>}
                
                <p className="text-xs text-gray-500">
                    Use at least 8 characters with a mix of letters, numbers & symbols
                </p>
                </div>
            )}
            </div>
        )}
        
        {/* Save button - Only shown in edit mode */}
        {editMode && (
            <div className="p-6 border-b border-gray-200">
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
            >
                {saving ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                ) : (
                <Save className="mr-2" size={18} />
                )}
                Save Changes
            </button>
            
            {error.general && (
                <p className="mt-2 text-sm text-red-600 text-center">{error.general}</p>
            )}
            </div>
        )}
        
        {/* Danger Zone */}
        <div className="p-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Danger Zone</h2>
            
            {!showDeleteConfirm ? (
            <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-4 py-2 border border-red-300 text-red-600 bg-white rounded-md hover:bg-red-50"
            >
                <Trash className="mr-2" size={18} />
                Delete Account
            </button>
            ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                Are you sure you want to delete your account?
                </h3>
                <p className="text-xs text-red-700 mb-4">
                This action cannot be undone. All your data will be permanently removed.
                </p>
                <div className="flex space-x-3">
                <button
                    onClick={handleDeleteAccount}
                    className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                    <Trash className="mr-1" size={14} />
                    Confirm Delete
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100"
                >
                    <X className="mr-1" size={14} />
                    Cancel
                </button>
                </div>
            </div>
            )}
        </div>
        </div>
        
        {/* Usage Stats - Optional */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h2>
            
            <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="text-sm font-medium">156 MB of 1 GB</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded-md">
                <span className="block text-xs text-gray-500">Total Photos</span>
                <span className="block text-lg font-semibold text-gray-800">42</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                <span className="block text-xs text-gray-500">Last Upload</span>
                <span className="block text-lg font-semibold text-gray-800">2 days ago</span>
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
    </main>
  );
};

export default Account;