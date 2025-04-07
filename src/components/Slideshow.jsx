'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, Play, Pause, Settings, X } from 'lucide-react';

const Slideshow = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for photos and slideshow controls
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
  
  // Fetch images from API
  const fetchImages = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setLoading(true);
    try {
      // Check if we have selected images from sessionStorage
      const searchParams = new URLSearchParams(window.location.search);
      const useSelected = searchParams.get('selected') === 'true';
      const selectedIds = JSON.parse(sessionStorage.getItem('slideshowIds') || '[]');
      const startIndex = parseInt(sessionStorage.getItem('slideshowStartIndex') || '0');
      
      // Fetch all images first
      const response = await fetch('/api/images?limit=500');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If we have selected images and the flag is set, filter to just those images
      if (useSelected && selectedIds.length > 0) {
        const filteredImages = data.images.filter(img => selectedIds.includes(img.id));
        setPhotos(filteredImages);
        // Set the initial index if available
        if (startIndex >= 0 && startIndex < filteredImages.length) {
          setCurrentIndex(startIndex);
        }
      } else {
        setPhotos(data.images || []);
      }
      
    } catch (error) {
      console.error('Error fetching images:', error);
      setError(`Failed to load images: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [status]);
  
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);
  
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
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious]);
  
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
            onClick={() => router.push('/images')}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }
  
  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white p-6">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">No Photos Available</h2>
          <p className="mb-4">There are no photos available to display in the slideshow.</p>
          <button 
            onClick={() => router.push('/upload')}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded mr-3"
          >
            Upload Photos
          </button>
          <button 
            onClick={() => router.push('/images')}
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
          >
            Back to Gallery
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
                    <span key={idx} className="px-2 py-0.5 bg-violet-600 rounded-full text-xs">
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
                Tip: Use arrow keys to navigate, spacebar to play/pause
              </div>
            </div>
          )}
          
          {/* Top navigation bar */}
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 flex justify-between items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push('/images');
              }}
              className="text-sm font-medium hover:text-violet-300"
            >
              Exit Slideshow
            </button>
            
            <div className="text-center text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="p-1 rounded-full hover:bg-gray-700"
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
              className="bg-violet-600 hover:bg-violet-700 rounded-full p-3 text-white flex items-center justify-center"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Slideshow;