import { useState, useRef } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './UploadButton.css';

export default function UploadButton({ onUpload }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized. Please add your URL and Anon Key to .env.local");
      }
      setIsUploading(true);
      
      const fileName = `${Date.now()}-${file.name}`;
      
      const { error } = await supabase
        .storage
        .from('memories')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase
        .storage
        .from('memories')
        .getPublicUrl(fileName);

      onUpload(publicUrl);
      
    } catch (error) {
      console.error("Supabase Upload Error:", error);
      alert(`Upload failed: ${error.message || 'Check your Supabase settings!'}`);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <>
      <button 
        className={`upload-button ${isUploading ? 'uploading' : ''}`} 
        onClick={handleClick}
        aria-label="Add Memory"
        disabled={isUploading}
      >
        <span className="upload-icon-wrapper">
          {isUploading ? (
            <Loader2 size={24} className="upload-icon spinning" />
          ) : (
            <Plus size={24} className="upload-icon" />
          )}
        </span>
        <span className="upload-text">
          {isUploading ? 'Uploading...' : 'Add Memory'}
        </span>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
}

