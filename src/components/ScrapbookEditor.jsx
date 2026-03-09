import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { 
  BringToFront, 
  SendToBack, 
  Download, 
  Image as ImageIcon, 
  Type, 
  Trash2,
  X
} from 'lucide-react';
import { compressImage } from '../utils/imageUtils';
import { supabase } from '../supabaseClient';
import './ScrapbookEditor.css';

const PAPER_TEXTURE = 'https://www.transparenttextures.com/patterns/notebook.png';

export default function ScrapbookEditor({ onCancel, onSave }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize Fabric Canvas (Compatible with v7)
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#fdfcf0', 
    });

    // Add subtle paper texture
    fabric.FabricImage.fromURL(PAPER_TEXTURE, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      img.set({
        opacity: 0.1,
        selectable: false,
        evented: false,
      });
      img.scaleToWidth(canvas.width);
      img.scaleToHeight(canvas.height);
      canvas.add(img);
      canvas.sendToBack(img);
    });

    fabricRef.current = canvas;

    // Custom controls styling
    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.cornerColor = '#5c4033';
    fabric.FabricObject.prototype.cornerStyle = 'circle';
    fabric.FabricObject.prototype.borderColor = '#5c4033';
    fabric.FabricObject.prototype.cornerSize = 12;

    return () => {
      canvas.dispose();
    };
  }, []);

  const addObjectWithShadow = (obj) => {
    obj.set({
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.2)',
        blur: 15,
        offsetX: 5,
        offsetY: 8,
      }),
    });
    fabricRef.current.add(obj);
    fabricRef.current.setActiveObject(obj);
    fabricRef.current.renderAll();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const reader = new FileReader();

    reader.onload = async (f) => {
      const data = f.target.result;
      const img = await fabric.FabricImage.fromURL(data);
      img.scaleToWidth(300);
      addObjectWithShadow(img);
    };
    reader.readAsDataURL(compressed);
  };

  const addText = () => {
    const text = new fabric.IText('Your Cat Story...', {
      left: 100,
      top: 100,
      fontFamily: 'Georgia, serif',
      fontSize: 24,
      fill: '#5c4033',
    });
    addObjectWithShadow(text);
  };

  const bringToFront = () => {
    const active = fabricRef.current.getActiveObject();
    if (active) {
      active.bringToFront();
      fabricRef.current.renderAll();
    }
  };

  const sendToBack = () => {
    const active = fabricRef.current.getActiveObject();
    if (active) {
      active.sendToBack();
      // Ensure texture stays at the very back
      const objects = fabricRef.current.getObjects();
      const texture = objects[0]; // First object added was the texture
      if (texture && texture.selectable === false) {
        texture.sendToBack();
      }
      fabricRef.current.renderAll();
    }
  };

  const deleteSelected = () => {
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.remove(active);
      fabricRef.current.renderAll();
    }
  };

  const handleExport = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const dataURL = fabricRef.current.toDataURL({
        format: 'webp',
        quality: 0.8,
        multiplier: 2, 
      });

      const res = await fetch(dataURL);
      const blob = await res.blob();
      const fileName = `scrapbook-${Date.now()}.webp`;

      const { error } = await supabase.storage.from('memories').upload(fileName, blob);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(fileName);
      onSave(publicUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to save scrapbook');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="scrapbook-editor-overlay">
      <div className="editor-container">
        <div className="editor-header">
          <h2>Cat Memories Designer 🎨</h2>
          <button className="close-btn" onClick={onCancel}><X size={24} /></button>
        </div>

        <div className="editor-layout">
          <aside className="editor-sidebar">
            <button className="tool-btn" onClick={() => fileInputRef.current.click()}>
              <ImageIcon size={20} />
              <span>Add Photo</span>
            </button>
            <button className="tool-btn" onClick={addText}>
              <Type size={20} />
              <span>Add Text</span>
            </button>
            <hr />
            <button className="tool-btn" onClick={bringToFront}>
              <BringToFront size={20} />
              <span>Bring Forward</span>
            </button>
            <button className="tool-btn" onClick={sendToBack}>
              <SendToBack size={20} />
              <span>Send Backward</span>
            </button>
            <button className="tool-btn delete" onClick={deleteSelected}>
              <Trash2 size={20} />
              <span>Remove</span>
            </button>
            <div className="footer-actions">
              <button 
                className="save-btn" 
                onClick={handleExport}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Post to Gallery'}
                <Download size={20} />
              </button>
            </div>
          </aside>

          <main className="editor-canvas-wrapper">
            <canvas ref={canvasRef} />
          </main>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>
    </div>
  );
}
