import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FloatingGallery.css';

gsap.registerPlugin(ScrollTrigger);

export default function FloatingGallery({ images = [], onImageClick }) {
  const galleryRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    // Only apply ScrollTrigger once items render
    if (images.length === 0) return;

    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item, index) => {
        if (!item) return;
        
        // Varying speed for upward drifting
        const speed = 1 + (index % 3) * 0.4; // Slightly gentler speed multiplier
        
        gsap.fromTo(item, 
          { y: 80 }, 
          {
            y: -120 * speed,
            ease: "none",
            scrollTrigger: {
              trigger: item, // Use the item itself as the trigger for better local positioning
              start: "top bottom+=100", // Start slightly before it enters viewport
              end: "bottom top",
              scrub: 1.5,
            }
          }
        );
      });
    }, galleryRef);

    return () => ctx.revert();
  }, [images]);

  return (
    <section className="floating-gallery" ref={galleryRef}>
      <div className="gallery-grid">
        {images.map((imgSrc, index) => {
          // Logic to avoid clumping: Use previous state to decide next size
          // We use a simple rule: if the previous one was 'special', this one must be standard.
          // Since map doesn't easily track previous results in a stateless way, we use index-based logic.
          const prevSeed = index > 0 ? (index - 1) * 1337 % 100 : 0;
          const prevWasSpecial = prevSeed > 70;
          
          const sizeSeed = (index * 1337) % 100;
          let sizeClass = '';
          
          if (!prevWasSpecial) {
             if (sizeSeed > 85) sizeClass = 'span-2x2';
             else if (sizeSeed > 70) sizeClass = 'span-wide';
          }

          return (
            <div 
              key={index} 
              ref={el => itemsRef.current[index] = el}
              className={`gallery-item ${sizeClass}`}
              onClick={() => onImageClick?.(imgSrc)}
            >
              <div className="item-inner">
                <img 
                  src={imgSrc} 
                  alt={`Memory ${index + 1}`} 
                  className="gallery-image"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
