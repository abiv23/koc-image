'use client';

import Link from 'next/link';
import { Camera, Upload, Users, Shield, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 bg-[url('/images/koc-img.webp')] bg-cover bg-center bg-no-repeat relative min-h-[60vh] flex items-center">
          <div className="absolute inset-0 bg-[#003DA5]/40"></div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="text-[#003DA5]" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Knights of Columbus
            </h1>
            <p className="text-2xl text-white mb-2">Arvada Council #12395</p>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Our council&apos;s photo sharing platform for capturing moments of faith, fellowship, and service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upload"
                className="bg-[#FFD100] text-[#003DA5] px-6 py-3 rounded-md hover:bg-[#E6BD00] transition-colors font-medium inline-flex items-center drop-shadow-lg"
              >
                <Upload className="mr-2" size={20} />
                Upload Photos
              </Link>
              <Link
                href="/images"
                className="bg-white text-[#003DA5] px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium inline-flex items-center drop-shadow-lg"
              >
                <Camera className="mr-2" size={20} />
                Browse Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#003DA5] mb-12">
              Simple Photo Management for Our Council
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#003DA5] transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#003DA5]/5 rounded-bl-full"></div>
                <div className="bg-[#003DA5] text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FFD100] group-hover:text-[#003DA5] transition-colors">
                  <Upload size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#003DA5]">Easy Uploading</h3>
                <p className="text-gray-600">
                  Quickly upload photos from your council events with our simple drag-and-drop interface.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#003DA5] transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#003DA5]/5 rounded-bl-full"></div>
                <div className="bg-[#003DA5] text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FFD100] group-hover:text-[#003DA5] transition-colors">
                  <Camera size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#003DA5]">Automatic Resizing</h3>
                <p className="text-gray-600">
                  Photos are automatically optimized and resized for sharing on our council website.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#003DA5] transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#003DA5]/5 rounded-bl-full"></div>
                <div className="bg-[#003DA5] text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FFD100] group-hover:text-[#003DA5] transition-colors">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#003DA5]">Council Access</h3>
                <p className="text-gray-600">
                  All council members can easily access and share photos from our events and activities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Knights of Columbus Principles Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#003DA5] mb-2">
              The Four Principles of the Knights of Columbus
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
              Our council is guided by these four core principles that shape our service and fraternity.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Charity */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#003DA5] h-2"></div>
                <div className="p-6">
                  <div className="bg-[#003DA5]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Shield className="text-[#003DA5]" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#003DA5]">Charity</h3>
                  <p className="text-gray-600">
                    Our Catholic faith teaches us to &apos;Love thy neighbor as thyself.&apos; Knights recognize that our mission is to serve those in need.
                  </p>
                </div>
              </div>
              
              {/* Unity */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#D80000] h-2"></div>
                <div className="p-6">
                  <div className="bg-[#D80000]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Shield className="text-[#D80000]" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#D80000]">Unity</h3>
                  <p className="text-gray-600">
                    None of us is as good as all of us. Together, we can accomplish far more than any of us could individually.
                  </p>
                </div>
              </div>
              
              {/* Fraternity */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#FFD100] h-2"></div>
                <div className="p-6">
                  <div className="bg-[#FFD100]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Shield className="text-[#FFD100]" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#AD8D00]">Fraternity</h3>
                  <p className="text-gray-600">
                    The Knights of Columbus was founded on the principles of protecting the livelihood of Catholic families. We continue this mission today.
                  </p>
                </div>
              </div>
              
              {/* Patriotism */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#003DA5] h-2"></div>
                <div className="p-6">
                  <div className="bg-[#003DA5]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Shield className="text-[#003DA5]" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#003DA5]">Patriotism</h3>
                  <p className="text-gray-600">
                    Members of the Knights of Columbus are proud of their devotion to God and country, and believe in standing up for both.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 px-4 bg-[#003DA5] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Digital Community</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Help us build a visual history of our council&apos;s activities by contributing your photos to our shared collection.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="bg-[#FFD100] text-[#003DA5] px-6 py-3 rounded-md font-medium hover:bg-yellow-300 transition-colors">
                Create Account
              </Link>
              <Link href="/login" className="bg-white text-[#003DA5] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}