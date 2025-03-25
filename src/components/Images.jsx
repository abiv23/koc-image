'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Camera, Search, Filter, SortDesc } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Photos = () => {
  const { data: session, status } = useSession();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, you would fetch from your API
    const mockPhotos = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Photo ${i + 1}`,
      url: `/api/placeholder/400/300?text=Photo+${i + 1}`,
      uploadedBy: 'John Doe',
      uploadedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      tags: ['event', 'meeting', 'group'].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)
    }));
    
    setTimeout(() => {
      setPhotos(mockPhotos);
      setLoading(false);
    }, 800); // Simulate loading delay
  }, []);

  const filteredPhotos = photos.filter(photo => 
    photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
    <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Photo Library</h1>
            <p className="text-gray-600">Browse and manage your Knights of Columbus photos</p>
        </div>
        
        {/* Search and Filters */}
        <div className="w-full md:w-auto mt-4 md:mt-0">
            <div className="flex items-center gap-2">
            <div className="relative flex-grow">
                <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button 
                className="bg-white border border-gray-300 rounded-md p-2 hover:bg-gray-50"
                onClick={() => setFilterOpen(!filterOpen)}
            >
                <Filter className="text-gray-700" size={20} />
            </button>
            <button className="bg-white border border-gray-300 rounded-md p-2 hover:bg-gray-50">
                <SortDesc className="text-gray-700" size={20} />
            </button>
            </div>
            
            {/* Filter Panel (simplified) */}
            {filterOpen && (
            <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">Filter by:</h3>
                <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">Event</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Meeting</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Group</button>
                </div>
            </div>
            )}
        </div>
        </div>
        
        {/* Photo Grid */}
        {loading ? (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        </div>
        ) : filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No photos found</h3>
            <p className="text-gray-600 mb-4">
            {searchTerm 
                ? `No photos matching "${searchTerm}"`
                : "There are no photos in your library yet"}
            </p>
            <Link href="/upload" className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-800">
            Upload photos <span className="ml-1">→</span>
            </Link>
        </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
            <Link href={`/photo/${photo.id}`} key={photo.id}>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square relative">
                    <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    />
                </div>
                <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 truncate">{photo.title}</h3>
                    <p className="text-xs text-gray-500">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                    {photo.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs">
                        {tag}
                        </span>
                    ))}
                    </div>
                </div>
                </div>
            </Link>
            ))}
        </div>
        )}
    </div>
    </main>
  );
};

export default Photos;