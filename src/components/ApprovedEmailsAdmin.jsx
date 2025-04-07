'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Upload, Download, Save, AlertCircle, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ApprovedEmailsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [approvedEmails, setApprovedEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [newEmail, setNewEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddResults, setBulkAddResults] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);
  
  // Check if user is admin (for now, assume user with id 1 is admin)
  const isAdmin = session?.user?.email?.toLowerCase() === "abiv23@gmail.com";
  
  // Fetch approved emails
  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;
    
    const fetchApprovedEmails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/approved-emails');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch approved emails: ${response.status}`);
        }
        
        const data = await response.json();
        setApprovedEmails(data.emails || []);
      } catch (error) {
        console.error('Error fetching approved emails:', error);
        setError('Failed to load approved emails list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovedEmails();
  }, [status, isAdmin]);
  
  // Add a new approved email
  const handleAddEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/approved-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to add email: ${response.status}`);
      }
      
      const data = await response.json();
      setSuccess(data.message || 'Email added successfully');
      
      // Refresh emails list
      const updatedResponse = await fetch('/api/admin/approved-emails');
      const updatedData = await updatedResponse.json();
      setApprovedEmails(updatedData.emails || []);
      
      // Clear input
      setNewEmail('');
    } catch (error) {
      console.error('Error adding email:', error);
      setError(error.message || 'Failed to add email');
    }
  };
  
  // Remove an approved email
  const handleRemoveEmail = async (email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the approved list?`)) {
      return;
    }
    
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/admin/approved-emails?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to remove email: ${response.status}`);
      }
      
      const data = await response.json();
      setSuccess(data.message || 'Email removed successfully');
      
      // Update local state
      setApprovedEmails(prev => prev.filter(e => e.email !== email));
    } catch (error) {
      console.error('Error removing email:', error);
      setError(error.message || 'Failed to remove email');
    }
  };
  
  // Bulk add emails
  const handleBulkAdd = async (e) => {
    e.preventDefault();
    
    if (!bulkEmails.trim()) {
      setError('Please enter emails to add');
      return;
    }
    
    setError('');
    setSuccess('');
    setBulkAddResults(null);
    
    // Parse emails (newlines, commas, or semicolons)
    const emails = bulkEmails
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    if (emails.length === 0) {
      setError('No valid emails found');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/approved-emails', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to add emails: ${response.status}`);
      }
      
      const data = await response.json();
      setSuccess(`Emails processed successfully`);
      setBulkAddResults(data.results);
      
      // Refresh emails list
      const updatedResponse = await fetch('/api/admin/approved-emails');
      const updatedData = await updatedResponse.json();
      setApprovedEmails(updatedData.emails || []);
      
      // Clear input
      setBulkEmails('');
    } catch (error) {
      console.error('Error bulk adding emails:', error);
      setError(error.message || 'Failed to add emails');
    }
  };
  
  // Export emails to CSV
  const handleExport = () => {
    if (approvedEmails.length === 0) {
      setError('No emails to export');
      return;
    }
    
    // Create CSV content
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + 'Email,Added By,Created At\n'
      + approvedEmails.map(email => 
          `${email.email},${email.added_by || 'N/A'},${new Date(email.created_at).toLocaleString()}`
        ).join('\n');
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `approved-emails-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
  };
  
  if (status === "loading") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (!isAdmin) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="mr-2" size={24} />
              <h1 className="text-xl font-bold">Access Denied</h1>
            </div>
            <p className="text-gray-600 mb-4">You don't have permission to access this page. Only administrators can manage approved emails.</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
            >
              Back to Homepage
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Approved Emails</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowBulkAdd(!showBulkAdd)}
                className={`flex items-center px-3 py-2 rounded-md ${
                  showBulkAdd 
                    ? 'bg-violet-100 text-violet-700 border border-violet-300' 
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                <Upload size={18} className="mr-2" />
                Bulk Add Emails
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={approvedEmails.length === 0}
              >
                <Download size={18} className="mr-2" />
                Export List
              </button>
            </div>
          </div>
          
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <AlertCircle className="text-red-500 mr-3" size={24} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex">
                <Check className="text-green-500 mr-3" size={24} />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}
          
          {/* Bulk Add Form */}
          {showBulkAdd && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Bulk Add Emails</h2>
              <form onSubmit={handleBulkAdd}>
                <div className="mb-4">
                  <label htmlFor="bulkEmails" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter emails (one per line, or separated by commas)
                  </label>
                  <textarea
                    id="bulkEmails"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={6}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowBulkAdd(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                  >
                    <Save size={18} className="inline mr-2" />
                    Add All Emails
                  </button>
                </div>
              </form>
              
              {/* Bulk Add Results */}
              {bulkAddResults && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Results:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✅ Added: {bulkAddResults.added}</li>
                    <li>🔄 Reactivated: {bulkAddResults.reactivated}</li>
                    <li>ℹ️ Already exists: {bulkAddResults.alreadyExists}</li>
                    <li>❌ Failed: {bulkAddResults.failed}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Add Single Email */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Approved Email</h2>
            <form onSubmit={handleAddEmail} className="flex gap-3">
              <div className="flex-grow">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Email
              </button>
            </form>
          </div>
          
          {/* Emails List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Approved Emails</h2>
              <p className="text-sm text-gray-600">
                These emails are pre-approved for registration in the application.
              </p>
            </div>
            
            {loading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
              </div>
            ) : approvedEmails.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No approved emails found. Add some emails to allow users to register.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedEmails.map((email, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {email.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {email.added_by || 'System'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(email.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveEmail(email.email)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}