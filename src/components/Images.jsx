'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Search, Filter, LoaderCircle, X, Play, Check, User, ArrowUp, ArrowDown } from 'lucide-react';

const Images = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  
  // New filtering and sorting state
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  
  // Slideshow selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 12;
  
  // Fetch images from API
  const fetchImages = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setLoading(true);
    try {
      const tagQuery = filterTag ? `&tag=${encodeURIComponent(filterTag)}` : '';
      const userOnlyQuery = showOnlyMine ? '&userOnly=true' : '';
      const sortQuery = `&sortOrder=${sortOrder === 'oldest' ? 'asc' : 'desc'}`;
      
      const response = await fetch(
        `/api/images?limit=${itemsPerPage}&offset=${page * itemsPerPage}${tagQuery}${userOnlyQuery}${sortQuery}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If first page, replace all photos. Otherwise append
      if (page === 0) {
        setPhotos(data.images || []);
      } else {
        setPhotos(prevPhotos => [...prevPhotos, ...(data.images || [])]);
      }
      
      setHasMore(data.pagination?.hasMore || false);
      
      // Build a unique list of all tags for filtering
      const allTags = (data.images || []).flatMap(image => image.tags || []);
      const uniqueTags = [...new Set(allTags)].filter(Boolean);
      setAvailableTags(uniqueTags);
      
    } catch (error) {
      console.error('Error fetching images:', error);
      setError(`Failed to load images: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [status, filterTag, showOnlyMine, sortOrder, page, itemsPerPage]);
  
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);
  
  // Handle image load error (404s)
  const handleImageError = (photoId) => {
    console.log(`Image with ID ${photoId} failed to load, removing from display`);
    setPhotos(currentPhotos => currentPhotos.filter(photo => photo.id !== photoId));
  };
  
  // Filter images client-side based on search term
  const filteredPhotos = photos.filter(photo => 
    photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (photo.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Load more photos
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };
  
  // Apply a tag filter
  const applyTagFilter = (tag) => {
    setFilterTag(prev => prev === tag ? '' : tag);
    setPage(0); // Reset to first page when changing filters
    setFilterOpen(false);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilterTag('');
    setShowOnlyMine(false);
    setSortOrder('newest');
    setPage(0);
    setSearchTerm('');
  };
  
  // Retry loading if there was an error
  const retryFetch = () => {
    setError('');
    fetchImages();
  };
  
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button 
                className={`border rounded-md p-2 ${filterOpen || filterTag ? 'bg-[#003DA5]/10 border-[#003DA5]/30 text-[#003DA5]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setFilterOpen(!filterOpen)}
                title="Filter by tags"
              >
                <Filter size={20} />
              </button>
              <button
                className={`border rounded-md p-2 ${selectionMode ? 'bg-[#003DA5]/10 border-[#003DA5]/30 text-[#003DA5]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (!selectionMode) {
                    setSelectedPhotos([]);
                  }
                }}
                title={selectionMode ? "Cancel selection" : "Select photos for slideshow"}
              >
                <Check size={20} />
              </button>
              {selectionMode && selectedPhotos.length > 0 ? (
                <button 
                  onClick={() => {
                    // Store selected photo IDs in sessionStorage
                    sessionStorage.setItem('slideshowIds', JSON.stringify(selectedPhotos));
                    router.push('/slideshow?selected=true');
                  }}
                  className="bg-[#003DA5] text-white rounded-md px-3 py-2 hover:bg-[#002966] text-sm font-medium"
                  title="Start slideshow with selected photos"
                >
                  <Play size={16} className="inline mr-1" /> 
                  Play {selectedPhotos.length} selected
                </button>
              ) : (
                <Link href="/slideshow" className="bg-[#003DA5] text-white rounded-md p-2 hover:bg-[#002966]" title="Start slideshow with all photos">
                  <Play size={20} />
                </Link>
              )}
              <Link href="/upload" className="bg-[#003DA5] text-white rounded-md p-2 hover:bg-[#002966]" title="Upload photos">
                <Camera size={20} />
              </Link>
            </div>
            
            {/* Filter Panel */}
            {filterOpen && (
              <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">Filter by tag:</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.length > 0 ? (
                    availableTags.map((tag, idx) => (
                      <button
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filterTag === tag
                            ? 'bg-[#003DA5] text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => applyTagFilter(tag)}
                      >
                        {tag}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tags available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Filtering and Sorting Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Tag Filter Display */}
            {filterTag && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Tag:</span>
                <div className="bg-[#003DA5]/10 text-[#003DA5] rounded-full px-3 py-1 text-sm flex items-center">
                  {filterTag}
                  <button
                    className="ml-2 text-[#003DA5]"
                    onClick={() => {
                      setFilterTag('');
                      setPage(0);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* My Photos Toggle */}
            <button
              onClick={() => {
                setShowOnlyMine(!showOnlyMine);
                setPage(0); // Reset to first page
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                showOnlyMine 
                  ? 'bg-[#003DA5] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User size={16} className="mr-1.5" />
              {showOnlyMine ? 'All Photos' : 'My Photos'}
            </button>
            
            {/* Sort Order Toggle */}
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
                setPage(0); // Reset to first page
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center"
            >
              {sortOrder === 'newest' ? (
                <>
                  <ArrowDown size={16} className="mr-1.5" />
                  Newest First
                </>
              ) : (
                <>
                  <ArrowUp size={16} className="mr-1.5" />
                  Oldest First
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(filterTag || showOnlyMine || sortOrder === 'oldest' || searchTerm) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-700">Active filters:</span>
              
              {filterTag && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                  Tag: {filterTag}
                </span>
              )}
              
              {showOnlyMine && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                  My Photos Only
                </span>
              )}
              
              {sortOrder === 'oldest' && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                  Oldest First
                </span>
              )}
              
              {searchTerm && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                  Search: {searchTerm}
                </span>
              )}
              
              <button
                onClick={resetFilters}
                className="ml-auto px-2 py-0.5 text-xs text-blue-700 hover:text-blue-800"
              >
                Reset All
              </button>
            </div>
          </div>
        )}
        
        {/* Selection Mode Info */}
        {selectionMode && (
          <div className="mb-4 p-3 bg-[#003DA5]/5 border border-[#003DA5]/20 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#003DA5] font-medium">Selection mode active</p>
                <p className="text-sm text-[#003DA5]/80">
                  {selectedPhotos.length === 0 
                    ? "Click on photos to select them for a slideshow" 
                    : `${selectedPhotos.length} photo${selectedPhotos.length === 1 ? '' : 's'} selected`}
                </p>
              </div>
              <div>
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedPhotos([]);
                  }}
                  className="px-3 py-1 bg-white border border-[#003DA5]/30 text-[#003DA5] rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={retryFetch}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && page === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-[#003DA5] border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No photos found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterTag
                ? `No photos matching your search criteria`
                : showOnlyMine
                  ? "You haven't uploaded any photos yet"
                  : "There are no photos in the library yet"}
            </p>
            <Link href="/upload" className="inline-flex items-center text-sm font-medium text-[#003DA5] hover:text-[#002966]">
              Upload photos <span className="ml-1">→</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                    selectionMode && selectedPhotos.includes(photo.id) ? 'ring-2 ring-[#003DA5]' : ''
                  }`}
                  onClick={() => {
                    if (selectionMode) {
                      // Toggle photo selection
                      setSelectedPhotos(prev => 
                        prev.includes(photo.id) 
                          ? prev.filter(id => id !== photo.id)
                          : [...prev, photo.id]
                      );
                    } else {
                      router.push(`/photo/${photo.id}`);
                    }
                  }}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={photo.url}
                      alt={photo.description || photo.original_filename}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                      onError={() => handleImageError(photo.id)}
                    />
                    {selectionMode && selectedPhotos.includes(photo.id) && (
                      <div className="absolute top-2 right-2 bg-[#003DA5] text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                        <Check size={16} />
                      </div>
                    )}
                    {/* Owner indicator */}
                    {session?.user?.id && photo.user_id === parseInt(session.user.id) && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white rounded-md px-2 py-0.5 text-xs">
                        Yours
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-800 truncate flex-grow">
                        {photo.description || photo.original_filename}
                      </h3>
                      {!selectionMode && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            sessionStorage.setItem('slideshowIds', JSON.stringify([Number(photo.id)]));
                            sessionStorage.setItem('slideshowStartIndex', '0');
                            router.push('/slideshow?selected=true');
                          }}
                          className="ml-2 text-[#003DA5] hover:text-[#002966]"
                          title="Start slideshow from this photo"
                        >
                          <Play size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(photo.tags || []).slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#003DA5]/5 text-[#003DA5] rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {(photo.tags || []).length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
                          +{photo.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-[#003DA5]/30 text-[#003DA5] bg-white rounded-md hover:bg-[#003DA5]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003DA5]"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin mr-2" size={18} />
                      Loading more...
                    </>
                  ) : (
                    <>
                      Load more photos
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Images;