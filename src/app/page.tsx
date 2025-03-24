'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Upload, X } from 'lucide-react';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
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

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Files to upload:', selectedFiles);
    // Add your upload logic here
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-violet-600 flex flex-col items-center justify-center h-12 pt-2">
          <div className="rounded-full flex items-center justify-center">
            <Camera className="text-white" size={16} />
          </div>
          <h1 className="text-lg font-medium text-white flex items-center justify-center">
              Photo Upload
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col items-center justify-center h-40"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          {/* Upload Area */}
          <div className="relative w-full flex flex-col items-center">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center cursor-pointer transition-colors w-full ${
                isDragging ? 'border-violet-400 bg-violet-50' : 'border-gray-300 hover:border-violet-300'
              }`}
            >
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  Drag and drop your images here, or click to browse
                </p>
              </div>
            </div>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="mb-6 w-full text-center">
              <div className="flex items-center justify-center mb-3">
                <h2 className="text-sm font-medium text-gray-800 mr-2">
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
        </form>
      </div>
      <div className="w-max h-10 flex justify-center items-center mt-4">
        <div className="bg-violet-100 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-200 transition-colors"
             onClick={() => document.getElementById('fileInput')?.click()}>
          <Upload className="text-violet-600" size={20} />
        </div>
      </div>
    </div>
  );
}