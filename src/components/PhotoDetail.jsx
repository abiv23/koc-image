'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Download, Save, Camera, Trash, Maximize, Minimize, X, AlertTriangle, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PhotoDetail = ({ params }) => {
  const photoId = params?.id || 1;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [resizeMode, setResizeMode] = useState(false);
  const [resizeOptions, setResizeOptions] = useState({
    width: 800,
    height: 600,
    quality: 90,
    maintainAspectRatio: true
  });
  const [previewMode, setPreviewMode] = useState('original'); // 'original', 'resized'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const imageContainerRef = useRef(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);
  
  // Fetch photo from API
  useEffect(() => {
    const fetchPhoto = async () => {
      if (status !== "authenticated") return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/images/${photoId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Photo not found');
          }
          throw new Error(`Failed to fetch photo details: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Ensure the URL is properly set
        if (!data.url) {
          console.error('Image URL is missing from API response');
          throw new Error('Image data is incomplete');
        }
        
        setPhoto(data);
        
        // Initialize resize options based on image dimensions
        setResizeOptions(prev => ({
          ...prev,
          width: data.width || 800,
          height: data.height || 600
        }));
        
      } catch (error) {
        console.error('Error fetching photo:', error);
        setError(error.message || 'Failed to load photo details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhoto();
  }, [photoId, status]);
  
  // Log the image URL for debugging
  useEffect(() => {
    if (photo?.url) {
      console.log('Photo URL:', photo.url);
    }
  }, [photo]);
  
  // Calculate aspect ratio
  const aspectRatio = photo ? (photo.width / photo.height) || 1.33 : 1.33;
  
  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value);
    setResizeOptions({
      ...resizeOptions,
      width: newWidth,
      ...(resizeOptions.maintainAspectRatio && { height: Math.round(newWidth / aspectRatio) })
    });
  };
  
  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value);
    setResizeOptions({
      ...resizeOptions,
      height: newHeight,
      ...(resizeOptions.maintainAspectRatio && { width: Math.round(newHeight * aspectRatio) })
    });
  };
  
  const handleDownload = () => {
    if (!photo?.url) {
      setError('Cannot download: Image URL is not available');
      return;
    }
    
    setDownloadStarted(true);
    
    try {
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = photo.original_filename || `photo-${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset download state after a moment
      setTimeout(() => {
        setDownloadStarted(false);
      }, 2000);
    } catch (error) {
      console.error('Download error:', error);
      setError(`Failed to download image: ${error.message}`);
      setDownloadStarted(false);
    }
  };
  
  const handleSaveToAccount = () => {
    // In a real implementation, this would save the resized image to the user's account
    alert(`This would save the resized photo to your account in a real implementation`);
  };
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (imageContainerRef.current.requestFullscreen) {
        imageContainerRef.current.requestFullscreen();
      } else if (imageContainerRef.current.webkitRequestFullscreen) { // Safari
        imageContainerRef.current.webkitRequestFullscreen();
      } else if (imageContainerRef.current.msRequestFullscreen) { // IE11
        imageContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      const response = await fetch(`/api/images/${photoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete photo: ${response.status}`);
      }
      
      // Redirect back to images page
      router.push('/images');
      
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError(`Failed to delete photo: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button 
                    onClick={() => router.push('/images')}
                    className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
                  >
                    ← Back to images
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (!photo) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={48} />
            <h2 className="text-xl font-semibold mb-2">Photo Not Found</h2>
            <p className="text-gray-600 mb-4">The photo you're looking for is not available.</p>
            <button 
              onClick={() => router.push('/images')}
              className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
            >
              Back to Gallery
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 pb-10">
        {/* Top navigation bar */}
        <div className="bg-white shadow-sm py-3 px-4 mb-6">
          <div className="max-w-6xl mx-auto flex items-center">
            <button 
              onClick={() => router.push('/images')} 
              className="flex items-center text-sm font-medium text-gray-700 hover:text-violet-600"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Photos
            </button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4">
          {/* Success message for download */}
          {downloadStarted && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex">
                <Check className="text-green-600 mr-2" size={20} />
                <span className="text-green-700">Download started</span>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Photo header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {photo.description || photo.original_filename}
              </h1>
              <div className="flex flex-wrap items-center text-sm text-gray-500">
                <span>Uploaded on {new Date(photo.created_at).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>Original size: {photo.width || 'unknown'}x{photo.height || 'unknown'}</span>
                <span className="mx-2">•</span>
                <span>File size: {Math.round((photo.size || 0) / 1024)} KB</span>
              </div>
            </div>
            
            {/* Photo content */}
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Photo display */}
              <div className="lg:w-2/3 p-6">
                <div 
                  ref={imageContainerRef}
                  className={`relative bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden ${
                    isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''
                  }`}
                >
                  <div className="relative" style={{ 
                    width: previewMode === 'resized' ? `${resizeOptions.width}px` : '100%',
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: isFullscreen ? '100vh' : '600px'
                  }}>
                    <Image
                      src={photo.url}
                      alt={photo.description || photo.original_filename}
                      width={previewMode === 'resized' ? resizeOptions.width : photo.width || 800}
                      height={previewMode === 'resized' ? resizeOptions.height : photo.height || 600}
                      className="object-contain w-full"
                      onError={() => {
                        console.error(`Failed to load image: ${photo.url}`);
                        setError('Failed to load image. The image may no longer exist or be accessible.');
                      }}
                      priority={true}
                    />
                  </div>
                  
                  <button 
                    onClick={toggleFullscreen}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <button 
                    onClick={() => setResizeMode(!resizeMode)}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      resizeMode 
                        ? 'bg-violet-100 text-violet-700 border border-violet-300' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <Camera className="mr-2" size={18} />
                    {resizeMode ? 'Exit resize mode' : 'Resize photo'}
                  </button>
                  
                  {!resizeMode && (
                    <>
                      <button 
                        onClick={handleDownload}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
                      >
                        <Download className="mr-2" size={18} />
                        Download original
                      </button>
                      <button 
                        onClick={handleDelete}
                        className={`flex items-center px-4 py-2 ${
                          deleteConfirm 
                            ? 'bg-red-600 text-white' 
                            : 'bg-red-50 text-red-600 border border-red-200'
                        } rounded-md`}
                      >
                        <Trash className="mr-2" size={18} />
                        {deleteConfirm ? 'Confirm delete' : 'Delete'}
                      </button>
                      {deleteConfirm && (
                        <button 
                          onClick={() => setDeleteConfirm(false)} 
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md"
                        >
                          <X size={18} className="mr-2" />
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Right side - Resize controls (conditionally shown) */}
              {resizeMode && (
                <div className="lg:w-1/3 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Resize Options</h3>
                  
                  {/* Dimension controls */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        id="width"
                        value={resizeOptions.width}
                        onChange={handleWidthChange}
                        min="100"
                        max={photo.width || 3000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        id="height"
                        value={resizeOptions.height}
                        onChange={handleHeightChange}
                        min="100"
                        max={photo.height || 3000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                        Quality: {resizeOptions.quality}%
                      </label>
                      <input
                        type="range"
                        id="quality"
                        value={resizeOptions.quality}
                        onChange={(e) => setResizeOptions({...resizeOptions, quality: parseInt(e.target.value)})}
                        min="10"
                        max="100"
                        step="5"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="aspectRatio"
                        checked={resizeOptions.maintainAspectRatio}
                        onChange={(e) => setResizeOptions({...resizeOptions, maintainAspectRatio: e.target.checked})}
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                      />
                      <label htmlFor="aspectRatio" className="ml-2 block text-sm text-gray-700">
                        Maintain aspect ratio
                      </label>
                    </div>
                  </div>
                  
                  {/* Preview toggle */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview mode
                    </label>
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                      <button
                        className={`flex-1 py-2 text-sm font-medium ${
                          previewMode === 'original' 
                            ? 'bg-violet-100 text-violet-700' 
                            : 'bg-white text-gray-700'
                        }`}
                        onClick={() => setPreviewMode('original')}
                      >
                        Original
                      </button>
                      <button
                        className={`flex-1 py-2 text-sm font-medium ${
                          previewMode === 'resized' 
                            ? 'bg-violet-100 text-violet-700' 
                            : 'bg-white text-gray-700'
                        }`}
                        onClick={() => setPreviewMode('resized')}
                      >
                        Resized
                      </button>
                    </div>
                  </div>
                  
                  {/* File info */}
                  <div className="bg-gray-50 p-3 rounded-md mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">File information:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>Original size: {photo.width || 'unknown'}x{photo.height || 'unknown'}</li>
                      <li>New size: {resizeOptions.width}x{resizeOptions.height}</li>
                      <li>Estimated file size: ~{Math.round((resizeOptions.width * resizeOptions.height * resizeOptions.quality) / 90000)} KB</li>
                    </ul>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                    >
                      <Download className="mr-2" size={18} />
                      Download resized photo
                    </button>
                    
                    <button
                      onClick={handleSaveToAccount}
                      className="w-full flex items-center justify-center px-4 py-2 border border-violet-300 text-violet-700 bg-violet-50 rounded-md hover:bg-violet-100"
                    >
                      <Save className="mr-2" size={18} />
                      Save to my photo bank
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tags section */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {photo.tags && photo.tags.length > 0 ? (
                  photo.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PhotoDetail;