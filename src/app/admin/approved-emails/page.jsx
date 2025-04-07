'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminApprovedEmails from '@/components/AdminApprovedEmails';

export default function ApprovedEmailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated and admin
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && !session.user.isAdmin) {
      // Redirect non-admin users
      router.push('/');
    }
  }, [status, session, router]);
  
  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 px-4 py-8 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Only render the admin component if the user is authenticated and is an admin
  if (status === 'authenticated' && session.user.isAdmin) {
    return (
      <>
        <Header />
        <AdminApprovedEmails />
        <Footer />
      </>
    );
  }
  
  // Default fallback (should not reach here due to redirects)
  return null;
}