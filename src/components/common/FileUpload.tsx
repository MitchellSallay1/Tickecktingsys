import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import Button from './Button';

interface FileUploadProps {
  accept?: string;
  label?: string;
  error?: string;
  onChange: (file: File | null, error?: string) => void;
  value?: string;
  className?: string;
  previewType?: 'image' | 'file';
  maxSize?: number; // in bytes, defaults to 10MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*/*',
  label,
  error,
  onChange,
  value,
  className = '',
  previewType = 'file',
  maxSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
    }
    
    if (previewType === 'image' && !file.type.startsWith('image/')) {
      return 'File must be an image';
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      onChange(null, validationError);
      return;
    }

    // Create preview URL for images
    if (previewType === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(file.name);
    }

    onChange(file);
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

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      onChange(null, validationError);
      return;
    }

    if (previewType === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(file.name);
    }

    onChange(file);
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={`
          mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md relative
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          transition-colors duration-200
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                ref={fileInputRef}
                className="sr-only"
                accept={accept}
                onChange={handleFileChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {accept === 'image/*' ? 'PNG, JPG, GIF up to 10MB' : 'Any file up to 10MB'}
          </p>
        </div>

        {preview && (
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {preview && previewType === 'image' && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-full object-cover rounded-md"
          />
        </div>
      )}

      {preview && previewType === 'file' && (
        <div className="mt-2 text-sm text-gray-500">
          Selected file: {preview}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload; 