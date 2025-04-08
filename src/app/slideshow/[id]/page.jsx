// src/app/slideshow/[id]/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, Play, Pause, Settings, X, Home, Edit } from 'lucide-react';

export default function SlideshowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slideshowId = params.id;
  
  // State for slideshow data and controls
  const [slideshow, setSlideshow] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5); // Seconds per slide (default: 5)
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);
  
  // Fetch slideshow data
  useEffect(() => {
    if (status !== "authenticated") return;
    
    const fetchSlideshow = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/slideshows/${slideshowId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch slideshow: ${response.status}`);
        }
        
        const data = await response.json();
        setSlideshow(data.slideshow);
        setPhotos(data.slideshow.photos || []);
      } catch (error) {
        console.error('Error fetching slideshow:', error);
        setError(`Failed to load slideshow: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlideshow();
  }, [slideshowId, status]);
  
  // Auto-advance slides when playing
  useEffect(() => {
    let slideshowTimer;
    
    if (isPlaying && photos.length > 0) {
      slideshowTimer = setTimeout(() => {
        setCurrentIndex(prevIndex => 
          prevIndex === photos.length - 1 ? 0 : prevIndex + 1
        );
      }, speed * 1000);
    }
    
    return () => {
      if (slideshowTimer) clearTimeout(slideshowTimer);
    };
  }, [isPlaying, currentIndex, photos.length, speed]);
  
  const goToNext = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex(prevIndex => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  }, [photos.length]);
  
  const goToPrevious = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  }, [photos.length]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === ' ') {
        // Space bar toggles play/pause
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'Escape') {
        // Escape exits slideshow
        router.push('/slideshows');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious, router]);
  
  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mb-4"></div>
          <p>Loading slideshow...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white p-6">
        <div className="bg-red-900 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Error Loading Slideshow</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => router.push('/slideshows')}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
          >
            Back to Slideshows
          </button>
        </div>
      </div>
    );
  }
  
  if (!slideshow || photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white p-6">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">No Photos Available</h2>
          <p className="mb-4">This slideshow doesn't contain any photos or couldn't be found.</p>
          <button 
            onClick={() => router.push('/slideshows')}
            className="bg-[#003DA5] hover:bg-[#002966] px-4 py-2 rounded mr-3"
          >
            Back to Slideshows
          </button>
        </div>
      </div>
    );
  }
  
  const currentPhoto = photos[currentIndex];
  
  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center"
      onClick={toggleControls}
    >
      {/* Main photo display */}
      <div className="relative h-full w-full flex items-center justify-center">
        {currentPhoto && (
          <div className="relative w-full h-full">
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.description || currentPhoto.original_filename}
              fill
              sizes="100vw"
              className="object-contain"
              priority={true}
            />
            
            {/* Caption */}
            {currentPhoto.description && showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 md:p-6">
                <p className="text-lg md:text-xl">{currentPhoto.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(currentPhoto.tags || []).map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#003DA5] rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Controls - only shown when showControls is true */}
      {showControls && (
        <>
          {/* Settings panel */}
          {showSettings && (
            <div 
              className="absolute top-16 right-4 bg-black bg-opacity-70 p-4 rounded-lg text-white z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Slideshow Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1">
                  Speed: {speed} seconds per slide
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Tip: Use arrow keys to navigate, spacebar to play/pause</p>
                <p className="mt-1">ESC key to exit slideshow</p>
              </div>
            </div>
          )}
          
          {/* Top navigation bar */}
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/slideshows');
                }}
                className="text-sm font-medium hover:text-[#FFD100] flex items-center"
                title="Back to slideshows"
              >
                <Home size={18} className="mr-1" />
                Exit
              </button>
              
              {slideshow.isOwner && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/slideshows/${slideshowId}/edit`);
                  }}
                  className="ml-4 text-sm font-medium hover:text-[#FFD100] flex items-center"
                  title="Edit this slideshow"
                >
                  <Edit size={18} className="mr-1" />
                  Edit
                </button>
              )}
            </div>
            
            <div className="text-center text-sm">
              <h2 className="font-medium">{slideshow.title}</h2>
              <div className="text-xs text-gray-300">
                {currentIndex + 1} / {photos.length}
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="p-1 rounded-full hover:bg-gray-700"
              title="Slideshow settings"
            >
              <Settings size={20} />
            </button>
          </div>
          
          {/* Left/Right Navigation Buttons */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white"
          >
            <ChevronLeft size={30} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white"
          >
            <ChevronRight size={30} />
          </button>
          
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 flex justify-center items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="bg-[#003DA5] hover:bg-[#002966] rounded-full p-3 text-white flex items-center justify-center"
              title={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}