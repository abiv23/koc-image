'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Upload as UploadIcon, X, Tag, FileText, Check } from 'lucide-react';

export default function UploadComponent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [currentTag, setCurrentTag] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect if not authenticated
        if (status === "unauthenticated") {
            router.push('/login');
        }
    }, [status, router]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...filesArray]);
            
            const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files) {
            const filesArray = Array.from(e.dataTransfer.files);
            const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
            
            setSelectedFiles(prev => [...prev, ...imageFiles]);
            
            const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        const newPreviews = [...previews];
        
        // Release the object URL to avoid memory leaks
        URL.revokeObjectURL(newPreviews[index]);
        
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        
        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
    };

    // Handle tag input
    const handleAddTag = () => {
        if (currentTag.trim()) {
            // Check if tag already exists
            if (!tags.split(',').some(tag => tag.trim().toLowerCase() === currentTag.trim().toLowerCase())) {
                setTags(prev => prev ? `${prev}, ${currentTag.trim()}` : currentTag.trim());
            }
            setCurrentTag('');
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const removeTag = (tagToRemove) => {
        const tagList = tags.split(',').map(t => t.trim());
        const updatedTags = tagList.filter(tag => tag.toLowerCase() !== tagToRemove.toLowerCase()).join(', ');
        setTags(updatedTags);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (selectedFiles.length === 0) {
            setError('Please select at least one image to upload');
            return;
        }
        
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
            const totalFiles = selectedFiles.length;
            const uploadedFiles = [];
            
            // Upload each file with a delay to show progress
            for (let i = 0; i < totalFiles; i++) {
                const file = selectedFiles[i];
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('description', description);
                formData.append('tags', tags);
                
                const response = await fetch('/api/images/upload', {
                    method: 'POST',
                    body: formData,
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.details || 'Upload failed');
                }
                
                const result = await response.json();
                uploadedFiles.push(result.imageId);
                
                // Update progress
                setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
            }
            
            // Reset state and show success message
            setUploadSuccess(true);
            setSelectedFiles([]);
            setPreviews([]);
            setDescription('');
            setTags('');
            
            // Redirect to gallery after a delay
            setTimeout(() => {
                router.push('/images');
            }, 2000);
            
        } catch (error) {
            console.error('Upload error:', error);
            setError(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-violet-600 p-6">
                        <div className="flex items-center">
                            <div className="bg-white/20 rounded-full p-2 mr-4">
                                <Camera className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-medium text-white">Upload Photos</h1>
                                <p className="text-violet-200 text-sm mt-1">
                                    Share your KoC event photos with the community
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500">
                            <div className="flex">
                                <X className="text-red-500 mr-3" size={20} />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {uploadSuccess && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500">
                            <div className="flex">
                                <Check className="text-green-500 mr-3" size={20} />
                                <p className="text-green-700">
                                    Upload successful! Redirecting to gallery...
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Upload Area */}
                        <div 
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
                                isDragging ? 'border-violet-400 bg-violet-50' : 'border-gray-300 hover:border-violet-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('fileInput')?.click()}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            
                            <UploadIcon className="mx-auto text-gray-400 mb-4" size={36} />
                            
                            <p className="text-gray-700 font-medium mb-1">
                                Drag and drop your images here, or click to browse
                            </p>
                            <p className="text-gray-500 text-sm">
                                Supports JPG, PNG and GIF files
                            </p>
                        </div>

                        {/* Image Previews */}
                        {previews.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-medium text-gray-800">
                                        Selected Images
                                    </h2>
                                    <span className="text-xs bg-violet-100 text-violet-700 py-1 px-2 rounded-full">
                                        {previews.length} {previews.length === 1 ? 'file' : 'files'}
                                    </span>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square overflow-hidden rounded-md shadow-sm bg-white">
                                                    <Image
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        width={100}
                                                        height={100}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent form click
                                                        removeFile(index);
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description and Tags */}
                        <div className="space-y-4 mb-6">
                            {/* Description Field */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FileText size={16} className="mr-2" />
                                        Description
                                    </div>
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a description for your photos..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>
                            
                            {/* Tags Field */}
                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <Tag size={16} className="mr-2" />
                                        Tags
                                    </div>
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="currentTag"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Add tags (press Enter)"
                                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="bg-violet-600 text-white px-4 py-2 rounded-r-md hover:bg-violet-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                
                                {/* Display tags */}
                                {tags && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tags.split(',').map((tag, index) => (
                                            tag.trim() && (
                                                <div 
                                                    key={index} 
                                                    className="bg-violet-50 text-violet-700 rounded-full px-3 py-1 text-sm flex items-center"
                                                >
                                                    {tag.trim()}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag.trim())}
                                                        className="ml-1 text-violet-500 hover:text-violet-700"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="hidden"
                                    name="tags"
                                    value={tags}
                                />
                            </div>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Uploading... {uploadProgress}%
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-violet-600 h-2.5 rounded-full transition-all duration-300" 
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isUploading || selectedFiles.length === 0}
                            className={`w-full flex items-center justify-center py-3 rounded-md transition-colors ${
                                isUploading || selectedFiles.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-violet-600 text-white hover:bg-violet-700'
                            }`}
                        >
                            {isUploading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading
                                </div>
                            ) : (
                                <>
                                    <UploadIcon size={20} className="mr-2" />
                                    Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Photo' : 'Photos'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
