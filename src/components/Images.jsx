'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Search, Filter, LoaderCircle, X, AlertTriangle } from 'lucide-react';

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
  
  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 12;
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);
  
  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      if (status !== "authenticated") return;
      
      setLoading(true);
      try {
        const tagQuery = filterTag ? `&tag=${encodeURIComponent(filterTag)}` : '';
        const response = await fetch(`/api/images?limit=${itemsPerPage}&offset=${page * itemsPerPage}${tagQuery}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        
        const data = await response.json();
        
        // If first page, replace all photos. Otherwise append
        if (page === 0) {
          setPhotos(data.images);
        } else {
          setPhotos(prevPhotos => [...prevPhotos, ...data.images]);
        }
        
        setHasMore(data.pagination.hasMore);
        
        // Build a unique list of all tags for filtering
        const allTags = data.images.flatMap(image => image.tags);
        const uniqueTags = [...new Set(allTags)].filter(Boolean);
        setAvailableTags(uniqueTags);
        
      } catch (error) {
        console.error('Error fetching images:', error);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchImages();
  }, [status, filterTag, page]);
  
  // Handle image load error (404s)
  const handleImageError = (photoId) => {
    console.log(`Image with ID ${photoId} failed to load, removing from display`);
    setPhotos(currentPhotos => currentPhotos.filter(photo => photo.id !== photoId));
  };
  
  // Filter images client-side based on search term
  const filteredPhotos = photos.filter(photo => 
    photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
                className={`border rounded-md p-2 ${filterOpen || filterTag ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter size={20} />
              </button>
              <Link href="/upload" className="bg-violet-600 text-white rounded-md p-2 hover:bg-violet-700">
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
                            ? 'bg-violet-600 text-white'
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
        
        {/* Active Filter Display */}
        {filterTag && (
          <div className="mb-4 flex items-center">
            <span className="text-sm text-gray-600 mr-2">Filtered by tag:</span>
            <div className="bg-violet-100 text-violet-800 rounded-full px-3 py-1 text-sm flex items-center">
              {filterTag}
              <button
                className="ml-2 text-violet-600 hover:text-violet-800"
                onClick={() => setFilterTag('')}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Photo Grid */}
        {loading && page === 0 ? (
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
              {searchTerm || filterTag
                ? `No photos matching your search criteria`
                : "There are no photos in your library yet"}
            </p>
            <Link href="/upload" className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-800">
              Upload photos <span className="ml-1">→</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <Link href={`/photo/${photo.id}`} key={photo.id}>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square relative">
                      <Image
                        src={photo.url}
                        alt={photo.description || photo.original_filename}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        onError={() => handleImageError(photo.id)}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-800 truncate">
                        {photo.description || photo.original_filename}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {photo.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {photo.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
                            +{photo.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-violet-300 text-violet-700 bg-white rounded-md hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
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