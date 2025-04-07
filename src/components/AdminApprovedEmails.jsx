'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Trash, Check, AlertTriangle, Loader, Search } from 'lucide-react';

const AdminApprovedEmails = () => {
  const [loading, setLoading] = useState(true);
  const [approvedEmails, setApprovedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load approved emails
    fetchApprovedEmails();
  }, []);

  const fetchApprovedEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/approved-emails');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch approved emails: ${response.status}`);
      }
      
      const data = await response.json();
      setApprovedEmails(data.approvedEmails || []);
    } catch (err) {
      console.error('Error fetching approved emails:', err);
      setError('Failed to load approved emails list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async () => {
    setError('');
    setSuccess('');

    // Basic email validation
    if (!newEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (approvedEmails.some(e => e.email.toLowerCase() === newEmail.toLowerCase())) {
      setError('This email is already in the approved list');
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch('/api/admin/approved-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add email');
      }

      const data = await response.json();
      
      // Update the list with the new email
      setApprovedEmails([...approvedEmails, { 
        id: data.id || Date.now(), // Use the returned ID or fallback
        email: newEmail,
        createdAt: new Date().toISOString()
      }]);
      
      setSuccess(`Email ${newEmail} added successfully`);
      setNewEmail('');
    } catch (err) {
      console.error('Error adding email:', err);
      setError(err.message || 'Failed to add email');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveEmail = async (emailId) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/approved-emails?id=${emailId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove email');
      }

      // Remove from the list
      setApprovedEmails(approvedEmails.filter(e => e.id !== emailId));
      setSuccess('Email removed from approved list');
    } catch (err) {
      console.error('Error removing email:', err);
      setError(err.message || 'Failed to remove email');
    }
  };

  // Filter emails based on search term
  const filteredEmails = approvedEmails.filter(item => 
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Admin Header */}
        <div className="bg-violet-600 text-white rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center">
            <div className="bg-white/20 rounded-full p-2 mr-4">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-medium">Admin Panel</h1>
              <p className="text-violet-200 text-sm mt-1">
                Manage approved email addresses for registration
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 mb-6">
            <div className="flex">
              <AlertTriangle className="text-red-500 mr-3" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 mb-6">
            <div className="flex">
              <Check className="text-green-500 mr-3" size={20} />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Add New Email */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Approved Email</h2>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              onClick={handleAddEmail}
              disabled={isAdding}
              className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              {isAdding ? (
                <Loader className="animate-spin mr-2" size={16} />
              ) : (
                <Plus className="mr-2" size={16} />
              )}
              Add
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Only Knights with approved emails will be able to register for an account.
          </p>
        </div>

        {/* Approved Emails List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Approved Email Addresses</h2>
            
            {/* Search bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredEmails.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No emails match your search.' : 'No approved emails yet.'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredEmails.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div>
                    <span className="font-medium">{item.email}</span>
                    {item.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveEmail(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove email"
                  >
                    <Trash size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminApprovedEmails;