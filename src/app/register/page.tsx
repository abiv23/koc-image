'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Register from '@/components/Register';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Register />
      </main>
      <Footer />
    </div>
  );
}