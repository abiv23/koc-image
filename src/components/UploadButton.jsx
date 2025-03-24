import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const ImageUploadButton = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div className="relative">
      <div 
        className="w-max h-10 flex justify-center items-center cursor-pointer"
        onClick={handleButtonClick}
      >
        <div className="bg-violet-100 w-10 h-10 rounded-full flex items-center justify-center hover:bg-violet-200 transition-colors">
          <Upload className="text-violet-600" size={20} />
        </div>
      </div>
      
      {fileName && (
        <div className="text-sm text-gray-600 mt-2">
          {fileName}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploadButton;