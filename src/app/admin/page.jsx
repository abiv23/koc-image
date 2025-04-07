'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the approved emails page which is the main admin page
    router.push('/admin/approved-emails');
  }, [router]);
  
  return null; // This page just redirects, so no need for content
}