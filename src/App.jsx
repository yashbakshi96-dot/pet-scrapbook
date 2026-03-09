import { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from './supabaseClient';
import Hero from './components/Hero';

gsap.registerPlugin(ScrollTrigger);
import FloatingGallery from './components/FloatingGallery';
import UploadButton from './components/UploadButton';
import GensparkBackground from './components/GensparkBackground';

function App() {
  const [images, setImages] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchImages = async () => {
    setIsInitializing(true);
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized. Check your credentials.");
      }

      // 1. List files from 'memories' bucket
      const { data, error } = await supabase
        .storage
        .from('memories')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      if (data && data.length > 0) {
        // 2. Generate public URLs for each file
        const urls = data.map(file => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('memories')
            .getPublicUrl(file.name);
          return publicUrl;
        });

        // 3. Randomize the order on every refresh
        const shuffled = urls.sort(() => Math.random() - 0.5);

        setImages(shuffled);
        localStorage.setItem('scrapbook_memories', JSON.stringify(shuffled));
      } else {
        setImages([]);
      }
    } catch (error) {
      console.warn("Supabase fetch failed. Falling back to LocalStorage.", error);
      const saved = localStorage.getItem('scrapbook_memories');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Also shuffle the fallback
        setImages(parsed.sort(() => Math.random() - 0.5));
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (supabase) {
      fetchImages();
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleUpload = (newImageUrl) => {
    setImages(prev => {
      const updated = [newImageUrl, ...prev];
      localStorage.setItem('scrapbook_memories', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Initialize Lenis for soft weighted scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Store for resize
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      window.lenis = null;
    };
  }, []);

  // Recalculate scroll height when images load
  useEffect(() => {
    if (window.lenis) {
      setTimeout(() => {
        window.lenis.resize();
      }, 100);
    }
  }, [images]);

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <GensparkBackground />
        <main>
          <Hero />
          {!isInitializing && (
            <FloatingGallery 
              images={images} 
              onImageClick={(url) => setSelectedImage(url)} 
              onUpload={handleUpload}
            />
          )}

          {/* Lightbox / Modal View */}
          {selectedImage && (
            <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
              <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                <img src={selectedImage} alt="Large view" className="lightbox-image" />
                <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
