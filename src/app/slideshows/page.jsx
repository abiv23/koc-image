'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Play, Edit, Trash, Plus, AlertTriangle, Loader } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SlideshowsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slideshows, setSlideshows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSlideshows();
    }
  }, [status, router]);

  const fetchSlideshows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/slideshows');
      
      if (!response.ok) {
        throw new Error('Failed to fetch slideshows');
      }
      
      const data = await response.json();
      setSlideshows(data.slideshows || []);
    } catch (error) {
      console.error('Error fetching slideshows:', error);
      setError('Failed to load slideshows. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlideshow = async (id) => {
    if (deleteId !== id) {
      // First click - confirm
      setDeleteId(id);
      return;
    }
    
    try {
      const response = await fetch(`/api/slideshows/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete slideshow');
      }
      
      // Remove from the list
      setSlideshows(slideshows.filter(slideshow => slideshow.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting slideshow:', error);
      setError('Failed to delete slideshow. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 px-4 py-8 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#003DA5] border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Slideshows</h1>
            <Link
              href="/images?selection=true"
              className="bg-[#003DA5] text-white px-4 py-2 rounded-md hover:bg-[#002966] inline-flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Create New Slideshow
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="text-red-500 flex-shrink-0 mr-3" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin h-8 w-8 text-[#003DA5]" />
            </div>
          ) : slideshows.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No slideshows yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't created any slideshows yet. Create one to organize and share your photos!
              </p>
              <Link
                href="/images?selection=true"
                className="inline-flex items-center text-sm font-medium text-[#003DA5] hover:text-[#002966]"
              >
                Create your first slideshow <span className="ml-1">→</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {slideshows.map((slideshow) => (
                <div key={slideshow.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Thumbnail */}
                  <div className="aspect-video relative bg-gray-200">
                    {slideshow.thumbnailUrl ? (
                      <Image
                        src={`/uploads/${slideshow.thumbnailUrl}`}
                        alt={slideshow.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Play size={48} />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">{slideshow.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {slideshow.photo_count} photos • {new Date(slideshow.created_at).toLocaleDateString()}
                    </p>
                    
                    {slideshow.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{slideshow.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/slideshow/${slideshow.id}`}
                        className="inline-flex items-center text-[#003DA5] hover:text-[#002966]"
                      >
                        <Play size={16} className="mr-1" />
                        Play slideshow
                      </Link>
                      
                      <div className="flex space-x-2">
                        <Link
                          href={`/slideshows/${slideshow.id}/edit`}
                          className="p-1 text-gray-500 hover:text-[#003DA5]"
                          title="Edit slideshow"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteSlideshow(slideshow.id)}
                          className={`p-1 ${deleteId === slideshow.id ? 'text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                          title={deleteId === slideshow.id ? 'Click again to confirm delete' : 'Delete slideshow'}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}