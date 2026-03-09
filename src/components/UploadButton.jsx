import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
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
        throw new Error("Supabase client not initialized. Check your credentials.");
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
      console.error("Upload Error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset
    }
  };

  return (
    <>
      <div 
        className={`upload-card-wrapper ${isUploading ? 'uploading' : ''}`}
        onClick={handleClick}
      >
        <div className="upload-card-inner">
          {isUploading ? (
            <div className="upload-loading-wrapper">
              <Loader2 size={40} className="upload-icon spinning" />
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="paw-logo-wrapper">
              <svg viewBox="0 0 100 100" className="paw-logo-svg">
                <ellipse cx="50" cy="65" rx="28" ry="22" fill="currentColor"/>
                <ellipse cx="22" cy="38" rx="11" ry="13" fill="currentColor"/>
                <ellipse cx="42" cy="28" rx="10" ry="12" fill="currentColor"/>
                <ellipse cx="62" cy="28" rx="10" ry="12" fill="currentColor"/>
                <ellipse cx="80" cy="38" rx="11" ry="13" fill="currentColor"/>
              </svg>
              <span className="add-hint">+</span>
            </div>
          )}
        </div>
      </div>

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

