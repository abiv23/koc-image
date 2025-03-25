'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Download, Save, Camera, Share, Trash, Maximize, Minimize } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// This would be replaced with dynamic route params in a real app
const PhotoDetail = ({ params }) => {
  const photoId = params?.id || 1;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [photo, setPhoto] = useState({
    id: photoId,
    title: `Photo ${photoId}`,
    description: 'Event photo from our recent gathering',
    url: `/api/placeholder/800/600?text=Photo+${photoId}`,
    originalWidth: 2400,
    originalHeight: 1800,
    uploadedBy: 'John Doe',
    uploadedAt: new Date(Date.now() - 5000000000).toISOString(),
    tags: ['event', 'meeting', 'group']
  });
  
  const [resizeMode, setResizeMode] = useState(false);
  const [resizeOptions, setResizeOptions] = useState({
    width: 800,
    height: 600,
    quality: 90,
    maintainAspectRatio: true
  });
  const [previewMode, setPreviewMode] = useState('original'); // 'original', 'resized'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef(null);
  
  // Calculate aspect ratio
  const aspectRatio = photo.originalWidth / photo.originalHeight;
  
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
    // In a real implementation, this would generate a resized image based on resizeOptions
    // and trigger a download. For now, we'll just show an alert.
    alert(`Downloading photo at ${resizeOptions.width}x${resizeOptions.height} with ${resizeOptions.quality}% quality`);
  };
  
  const handleSaveToAccount = () => {
    // This would save the resized image to the user's account
    alert(`Saving resized photo to your account`);
  };
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (imageContainerRef.current.requestFullscreen) {
        imageContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 pb-10">
        {/* Top navigation bar */}
        <div className="bg-white shadow-sm py-3 px-4 mb-6">
          <div className="max-w-6xl mx-auto flex items-center">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-sm font-medium text-gray-700 hover:text-violet-600"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Photos
            </button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Photo header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{photo.title}</h1>
              <p className="text-gray-600 mb-4">{photo.description}</p>
              <div className="flex flex-wrap items-center text-sm text-gray-500">
                <span>Uploaded by {photo.uploadedBy}</span>
                <span className="mx-2">•</span>
                <span>{new Date(photo.uploadedAt).toLocaleString()}</span>
                <span className="mx-2">•</span>
                <span>Original size: {photo.originalWidth}x{photo.originalHeight}</span>
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
                      alt={photo.title}
                      width={previewMode === 'resized' ? resizeOptions.width : photo.originalWidth}
                      height={previewMode === 'resized' ? resizeOptions.height : photo.originalHeight}
                      className="object-contain w-full"
                    />
                  </div>
                  
                  <button 
                    onClick={toggleFullscreen}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full"
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
                      <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md">
                        <Share className="mr-2" size={18} />
                        Share
                      </button>
                      <button className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md">
                        <Trash className="mr-2" size={18} />
                        Delete
                      </button>
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
                        max={photo.originalWidth}
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
                        max={photo.originalHeight}
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
                      <li>Original size: {photo.originalWidth}x{photo.originalHeight}</li>
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
                {photo.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
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