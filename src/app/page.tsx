'use client';

import Link from 'next/link';
import { Camera, Upload, Users, Shield } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {

  return (
    <>
      <Header />
        <main className="min-h-screen bg-gray-100">
          {/* Hero Section */}
          <section className="pt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <div className="bg-violet-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="text-white" size={32} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Arvada KoC Photo Bank</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                A simple way to upload, store, and resize images for Knights of Columbus Council activities and events.
              </p>
              <Link href="/upload" className="bg-violet-600 text-white px-6 py-3 rounded-md hover:bg-violet-700 transition-colors font-medium inline-flex items-center">
                <Upload className="mr-2" size={20} />
                Upload Photos
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Simple Photo Management for Our Council
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Upload className="text-violet-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Easy Uploading</h3>
                  <p className="text-gray-600">
                    Quickly upload photos from your events with our simple drag-and-drop interface.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Camera className="text-violet-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Automatic Resizing</h3>
                  <p className="text-gray-600">
                    Photos are automatically optimized and resized for sharing on our council website.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Users className="text-violet-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Council Access</h3>
                  <p className="text-gray-600">
                    All council members can easily access and share photos from our events and activities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Knights of Columbus Principles Section */}
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                The Four Principles of the Knights of Columbus
              </h2>
              <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
                Our council is guided by these four core principles that shape our service and fraternity.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Charity */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-violet-600 h-2"></div>
                  <div className="p-6">
                    <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <Shield className="text-violet-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Charity</h3>
                    <p className="text-gray-600">
                      Our Catholic faith teaches us to &apos;Love thy neighbor as thyself.&apos; Knights recognize that our mission is to serve those in need.
                    </p>
                  </div>
                </div>
                
                {/* Unity */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-violet-600 h-2"></div>
                  <div className="p-6">
                    <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <Shield className="text-violet-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Unity</h3>
                    <p className="text-gray-600">
                      None of us is as good as all of us. Together, we can accomplish far more than any of us could individually.
                    </p>
                  </div>
                </div>
                
                {/* Fraternity */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-violet-600 h-2"></div>
                  <div className="p-6">
                    <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <Shield className="text-violet-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Fraternity</h3>
                    <p className="text-gray-600">
                      The Knights of Columbus was founded on the principles of protecting the livelihood of Catholic families. We continue this mission today.
                    </p>
                  </div>
                </div>
                
                {/* Patriotism */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-violet-600 h-2"></div>
                  <div className="p-6">
                    <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <Shield className="text-violet-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Patriotism</h3>
                    <p className="text-gray-600">
                      Members of the Knights of Columbus are proud of their devotion to God and country, and believe in standing up for both.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      <Footer />
    </>
  );
}
