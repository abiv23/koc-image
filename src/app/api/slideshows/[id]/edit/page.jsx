'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Save, Trash, GripVertical, Plus, Loader, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Sortable item component for drag and drop
const SortablePhoto = ({ photo, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative border-2 rounded-md overflow-hidden ${
        isDragging ? 'border-[#003DA5] shadow-lg' : 'border-gray-200'
      }`}
    >
      <div 
        className="absolute top-0 left-0 w-full h-8 bg-black/50 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} className="text-white" />
      </div>
      
      <div className="relative w-48 h-32 bg-gray-200 group">
        <Image 
          src={photo.url} 
          alt={photo.description || photo.original_filename}
          fill
          className="object-cover"
        />
        
        <button 
          onClick={() => onRemove(photo.id)}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  );
};

export default function EditSlideshowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slideshowId = params.id;
  
  const [slideshow, setSlideshow] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSlideshow();
    }
  }, [status, router, slideshowId]);
  
  const fetchSlideshow = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/slideshows/${slideshowId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch slideshow');
      }
      
      const data = await response.json();
      const slideshowData = data.slideshow;
      
      setSlideshow(slideshowData);
      setTitle(slideshowData.title);
      setDescription(slideshowData.description || '');
      setIsPublic(slideshowData.is_public);
      setPhotos(slideshowData.photos || []);
    } catch (error) {
      console.error('Error fetching slideshow:', error);
      setError('Failed to load slideshow. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update slideshow details
      const detailsResponse = await fetch(`/api/slideshows/${slideshowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          isPublic,
        }),
      });
      
      if (!detailsResponse.ok) {
        throw new Error('Failed to update slideshow details');
      }
      
      // Update photo order
      const orderResponse = await fetch(`/api/slideshows/${slideshowId}/photos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoOrder: photos.map(photo => photo.id),
        }),
      });
      
      if (!orderResponse.ok) {
        throw new Error('Failed to update photo order');
      }
      
      // Navigate to slideshows page
      router.push('/slideshows');
    } catch (error) {
      console.error('Error saving slideshow:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        
        return newItems;
      });
    }
  };
  
  const handleRemovePhoto = async (photoId) => {
    try {
      const response = await fetch(`/api/slideshows/${slideshowId}/photos/${photoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove photo');
      }
      
      // Remove from local state
      setPhotos(photos.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error removing photo:', error);
      setError('Failed to remove photo. Please try again.');
    }
  };
  
  if (status === 'loading' || loading) {
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
  
  if (!slideshow) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <AlertTriangle className="text-red-500 flex-shrink-0 mr-3" size={20} />
                <p className="text-red-700">Slideshow not found or you don't have permission to edit it.</p>
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/slideshows')}
                className="text-[#003DA5] hover:underline flex items-center"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to slideshows
              </button>
            </div>
          </div>
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
          <div className="mb-6">
            <button 
              onClick={() => router.push('/slideshows')}
              className="text-[#003DA5] hover:underline flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to slideshows
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Slideshow</h1>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="text-red-500 flex-shrink-0 mr-3" size={20} />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-[#003DA5] focus:ring-[#003DA5] border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this slideshow public to all council members
                </label>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">Photos</h2>
                <Link
                  href={`/slideshows/${slideshowId}/add-photos`}
                  className="bg-[#003DA5] text-white px-3 py-1.5 rounded-md hover:bg-[#002966] text-sm inline-flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Photos
                </Link>
              </div>
              
              {photos.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-500 mb-2">No photos in this slideshow</p>
                  <Link
                    href={`/slideshows/${slideshowId}/add-photos`}
                    className="text-[#003DA5] hover:underline text-sm"
                  >
                    Add photos to get started
                  </Link>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">
                    Drag photos to reorder them in the slideshow.
                  </p>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={photos.map(photo => photo.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {photos.map((photo) => (
                          <SortablePhoto
                            key={photo.id}
                            photo={photo}
                            onRemove={handleRemovePhoto}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => router.push('/slideshows')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title || photos.length === 0}
                className="px-4 py-2 bg-[#003DA5] text-white rounded-md hover:bg-[#002966] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}