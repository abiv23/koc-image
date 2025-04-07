'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Upload as UploadIcon, X, Tag, FileText, Check, AlertCircle, Loader } from 'lucide-react';

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
    
    // Bulk upload state
    const [uploadResults, setUploadResults] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [failedUploads, setFailedUploads] = useState([]);
    const [useSharedDescriptionTags, setUseSharedDescriptionTags] = useState(true);
    
    // Individual file metadata
    const [fileMetadata, setFileMetadata] = useState({});

    useEffect(() => {
        // Redirect if not authenticated
        if (status === "unauthenticated") {
            router.push('/login');
        }
    }, [status, router]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            addNewFiles(filesArray);
        }
    };
    
    const addNewFiles = (filesArray) => {
        // Filter to only image files
        const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
        
        // Update selectedFiles state
        setSelectedFiles(prev => [...prev, ...imageFiles]);
        
        // Create preview URLs
        const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        
        // Initialize metadata for each new file
        const newMetadata = {};
        imageFiles.forEach((file, index) => {
            const fileId = `file-${Date.now()}-${index}`;
            newMetadata[fileId] = {
                id: fileId,
                file: file,
                description: '',
                tags: '',
                useShared: true
            };
        });
        
        setFileMetadata(prev => ({...prev, ...newMetadata}));
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
            addNewFiles(filesArray);
        }
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        const newPreviews = [...previews];
        
        // Release the object URL to avoid memory leaks
        URL.revokeObjectURL(newPreviews[index]);
        
        // Remove the file and its preview
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        
        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        
        // Also clean up metadata
        const fileIds = Object.keys(fileMetadata);
        if (fileIds[index]) {
            const newMetadata = {...fileMetadata};
            delete newMetadata[fileIds[index]];
            setFileMetadata(newMetadata);
        }
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
    
    // Update file metadata
    const updateFileMetadata = (fileId, field, value) => {
        setFileMetadata(prev => ({
            ...prev,
            [fileId]: {
                ...prev[fileId],
                [field]: value
            }
        }));
    };
    
    // Toggle whether a file uses shared description/tags
    const toggleUseShared = (fileId) => {
        setFileMetadata(prev => ({
            ...prev,
            [fileId]: {
                ...prev[fileId],
                useShared: !prev[fileId].useShared
            }
        }));
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
        setUploadResults([]);
        setFailedUploads([]);
        setCurrentFileIndex(0);
        
        try {
            const totalFiles = selectedFiles.length;
            const uploadedFiles = [];
            const failed = [];
            
            // Upload each file sequentially
            for (let i = 0; i < totalFiles; i++) {
                setCurrentFileIndex(i);
                
                const file = selectedFiles[i];
                const fileId = Object.keys(fileMetadata).find(key => fileMetadata[key].file === file);
                const currentMetadata = fileMetadata[fileId] || {};
                
                // Determine which description and tags to use
                const fileDescription = currentMetadata.useShared || useSharedDescriptionTags 
                    ? description 
                    : currentMetadata.description || '';
                    
                const fileTags = currentMetadata.useShared || useSharedDescriptionTags
                    ? tags
                    : currentMetadata.tags || '';
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('description', fileDescription);
                formData.append('tags', fileTags);
                
                try {
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
                    
                    // Add to successful uploads
                    setUploadResults(prev => [...prev, {
                        file: file.name,
                        success: true,
                        imageId: result.imageId
                    }]);
                } catch (error) {
                    console.error(`Error uploading ${file.name}:`, error);
                    
                    // Add to failed uploads
                    failed.push({
                        file: file.name,
                        error: error.message || 'Upload failed'
                    });
                    
                    setUploadResults(prev => [...prev, {
                        file: file.name,
                        success: false,
                        error: error.message || 'Upload failed'
                    }]);
                    
                    setFailedUploads(prev => [...prev, {
                        file: file.name,
                        error: error.message || 'Upload failed'
                    }]);
                }
                
                // Update progress
                setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
            }
            
            // Show success message if at least some files were uploaded
            if (uploadedFiles.length > 0) {
                setUploadSuccess(true);
                
                // Only reset state if all uploads were successful
                if (failed.length === 0) {
                    // Reset form state
                    setSelectedFiles([]);
                    setPreviews([]);
                    setDescription('');
                    setTags('');
                    setFileMetadata({});
                    
                    // Redirect to gallery after a delay
                    setTimeout(() => {
                        router.push('/images');
                    }, 2000);
                }
            } else {
                setError('All uploads failed. Please try again.');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            setError(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };
    
    // Retry failed uploads
    const retryFailedUploads = () => {
        // Filter out failed uploads from selectedFiles
        const failedFileNames = failedUploads.map(f => f.file);
        const failedFiles = selectedFiles.filter(file => failedFileNames.includes(file.name));
        
        if (failedFiles.length > 0) {
            // Reset upload state
            setUploadResults([]);
            setFailedUploads([]);
            
            // Keep only the failed files
            setSelectedFiles(failedFiles);
            
            // Update previews to match
            const newPreviews = failedFiles.map(file => {
                // Find existing preview URL for this file if possible
                const index = selectedFiles.findIndex(f => f.name === file.name);
                return index >= 0 && index < previews.length ? previews[index] : URL.createObjectURL(file);
            });
            
            setPreviews(newPreviews);
            
            // Clean up metadata to match
            const newMetadata = {};
            Object.keys(fileMetadata).forEach(key => {
                const meta = fileMetadata[key];
                if (failedFileNames.includes(meta.file.name)) {
                    newMetadata[key] = meta;
                }
            });
            
            setFileMetadata(newMetadata);
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
                                <div>
                                    <p className="text-green-700">
                                        Upload successful! {failedUploads.length === 0 ? 'Redirecting to gallery...' : ''}
                                    </p>
                                    {failedUploads.length > 0 && (
                                        <p className="text-green-600 text-sm mt-1">
                                            {uploadResults.filter(r => r.success).length} of {uploadResults.length} files uploaded successfully.
                                        </p>
                                    )}
                                </div>
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
                            <p className="text-violet-600 text-sm mt-2 font-medium">
                                Bulk upload supported - select multiple files at once!
                            </p>
                        </div>

                        {/* Shared Description and Tags for all photos */}
                        {selectedFiles.length > 1 && (
                            <div className="mb-6 p-4 bg-violet-50 rounded-lg border border-violet-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-violet-800">Shared Information</h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="use-shared"
                                            checked={useSharedDescriptionTags}
                                            onChange={() => setUseSharedDescriptionTags(!useSharedDescriptionTags)}
                                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="use-shared" className="ml-2 text-sm text-violet-800">
                                            Apply to all photos
                                        </label>
                                    </div>
                                </div>
                                <p className="text-sm text-violet-700 mb-3">
                                    Add information that applies to all photos. You can override these for individual photos below.
                                </p>
                            </div>
                        )}

                        {/* Description and Tags */}
                        <div className="space-y-4 mb-6">
                            {/* Description Field */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FileText size={16} className="mr-2" />
                                        {selectedFiles.length > 1 ? 'Shared Description' : 'Description'}
                                    </div>
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={selectedFiles.length > 1 ? "Add a description for all photos..." : "Add a description..."}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>
                            
                            {/* Tags Field */}
                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <Tag size={16} className="mr-2" />
                                        {selectedFiles.length > 1 ? 'Shared Tags' : 'Tags'}
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
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {previews.map((preview, index) => {
                                            const fileId = Object.keys(fileMetadata)[index];
                                            const meta = fileMetadata[fileId] || {};
                                            
                                            return (
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
                                                    
                                                    {/* File details */}
                                                    <div className="mt-1 text-xs text-gray-500 truncate">
                                                        {selectedFiles[index]?.name}
                                                    </div>
                                                    
                                                    {/* Individual metadata toggle (only for multiple files) */}
                                                    {selectedFiles.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleUseShared(fileId);
                                                            }}
                                                            className={`mt-1 text-xs px-2 py-1 rounded ${
                                                                meta.useShared 
                                                                ? 'bg-violet-100 text-violet-700' 
                                                                : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            {meta.useShared ? 'Using shared info' : 'Custom info'}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Results */}
                        {uploadResults.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-800 mb-2">Upload Results</h3>
                                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    {uploadResults.map((result, index) => (
                                        <div key={index} className={`flex items-center p-2 text-sm ${
                                            result.success ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {result.success ? (
                                                <Check size={16} className="mr-2 text-green-500" />
                                            ) : (
                                                <AlertCircle size={16} className="mr-2 text-red-500" />
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="truncate">{result.file}</p>
                                                {!result.success && (
                                                    <p className="text-xs text-red-500">{result.error}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {failedUploads.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={retryFailedUploads}
                                        className="mt-2 text-sm text-violet-600 hover:text-violet-800 font-medium"
                                    >
                                        Retry failed uploads
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Uploading... {uploadProgress}% ({currentFileIndex + 1} of {selectedFiles.length})
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
                                    <Loader className="animate-spin h-5 w-5 mr-3 text-white" />
                                    Uploading {selectedFiles.length} {selectedFiles.length === 1 ? 'Photo' : 'Photos'}
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
    );
}