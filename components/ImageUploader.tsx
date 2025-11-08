import React, { useRef, useState } from 'react';
import { ImageIcon } from './icons';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  title: string;
  subtitle: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, title, subtitle }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/5 border border-[rgb(var(--color-subtle))] rounded-xl p-4 flex flex-col h-full">
      <h3 className="text-base font-semibold text-[rgb(var(--color-text-main))]">{title}</h3>
      <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3">{subtitle}</p>
      <div 
        className="flex-grow border-2 border-dashed border-[rgb(var(--color-subtle))] rounded-lg flex items-center justify-center cursor-pointer hover:border-[rgb(var(--color-accent))] transition-colors relative group"
        onClick={handleAreaClick}
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="object-contain h-full w-full rounded-md p-1" />
            <button 
                onClick={(e) => {e.stopPropagation(); handleClear();}} 
                className="absolute top-2 right-2 bg-[rgb(var(--color-bg))] text-white rounded-full p-1.5 hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                aria-label="Remove image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </>
        ) : (
          <div className="text-center text-[rgb(var(--color-muted))]">
            <ImageIcon className="mx-auto h-10 w-10" />
            <p className="mt-2 text-sm font-medium">Click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;