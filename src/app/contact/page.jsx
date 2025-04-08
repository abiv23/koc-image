'use client';

import Link from 'next/link';
import { Shield, Mail, User, Building, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#003DA5] p-6 flex items-center">
              <Shield className="text-[#FFD100] mr-3" size={32} />
              <h1 className="text-2xl font-bold text-white">Contact Us</h1>
            </div>
            
            <div className="p-6 sm:p-8">
              <p className="text-gray-700 mb-8 text-lg">
                For questions, support, or feedback about the Knights of Columbus photo sharing application, please reach out to:
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                <div className="flex items-start mb-2">
                  <User className="text-[#003DA5] mr-3 mt-1" size={22} />
                  <div>
                    <h2 className="font-semibold text-gray-800 text-lg">Andrew Biviano</h2>
                    <p className="text-gray-600">Application Administrator</p>
                  </div>
                </div>
                
                <div className="mt-4 text-gray-700">
                  <p className="mb-2">You can contact Andrew through:</p>
                  
                  <div className="ml-2 mt-4">
                    <div className="flex items-start mb-4">
                      <Building className="text-[#003DA5] mr-3 mt-1" size={20} />
                      <div>
                        <p className="font-medium">Knights of Columbus Council #12395</p>
                        <p className="text-gray-600">Contact Andrew at the next council meeting or event</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Building className="text-[#003DA5] mr-3 mt-1" size={20} />
                      <div>
                        <p className="font-medium">St. Joan of Arc Catholic Church</p>
                        <p className="text-gray-600">You can also reach him through the parish</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700">
                Thank you for using our photo sharing platform. We're committed to helping members of our council share and preserve memories of our activities and events.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <Link href="/" className="inline-flex items-center text-[#003DA5] hover:text-[#002966]">
                <ArrowLeft className="mr-2" size={16} />
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contact;