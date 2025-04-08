'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  const currentYear = new Date().getFullYear();
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#003DA5] p-6 flex items-center">
              <Shield className="text-[#FFD100] mr-3" size={32} />
              <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
            </div>
            
            <div className="p-6 sm:p-8">
              <p className="mb-6 text-gray-600">
                Last Updated: {currentYear}-04-08
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-3">
                  Welcome to the Knights of Columbus Council Photo Sharing platform. These Terms of Service ("Terms") govern your access to and use of our photo sharing application. By using our application, you agree to be bound by these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Eligibility</h2>
                <p className="text-gray-700 mb-3">
                  This application is available only to registered members of Knights of Columbus with pre-approved email addresses. You must be at least 18 years of age to use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">3. User Content</h2>
                <p className="text-gray-700 mb-3">
                  By uploading photos to our platform, you grant Knights of Columbus a non-exclusive, transferable, sub-licensable, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of operating and improving our service.
                </p>
                <p className="text-gray-700 mb-3">
                  You represent and warrant that you own or have the necessary rights to the content you upload, and that your content does not violate the rights of any third party.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Prohibited Content</h2>
                <p className="text-gray-700 mb-3">
                  You may not upload content that:
                </p>
                <ul className="list-disc ml-6 text-gray-700 mb-3">
                  <li className="mb-1">Is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                  <li className="mb-1">Infringes on any patent, trademark, trade secret, copyright, or other intellectual property rights</li>
                  <li className="mb-1">Violates or encourages any conduct that would violate any applicable law or regulation</li>
                  <li className="mb-1">Contains nudity, excessive violence, or offensive subject matter</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Modifications</h2>
                <p className="text-gray-700 mb-3">
                  We reserve the right to modify or replace these Terms at any time. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Termination</h2>
                <p className="text-gray-700 mb-3">
                  We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </section>
            </div>
            
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <Link href="/" className="inline-flex items-center text-[#003DA5] hover:text-[#002966]">
                ← Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Terms;
