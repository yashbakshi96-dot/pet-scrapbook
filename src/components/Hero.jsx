import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import './Hero.css';

export default function Hero() {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // 1. Float Animation (up and down gently)
    const floatAnim = gsap.to(textRef.current, {
      y: -15,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // 1.5 Scroll Fade-out and Zoom-out Effect
    const scrollFadeAnim = gsap.fromTo(textRef.current, 
      { 
        opacity: 1,
        scale: 1 
      },
      {
        opacity: 0,
        scale: 0.8, // Zoom out slightly
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", // When hero is at top of viewport
          end: "bottom center", // Fade out faster (by the time hero bottom hits center of screen)
          scrub: true, // Smooth scrub tied to scrollbar
        }
      }
    );

    // 2. Bridget Mouse-Parallax Tilt Effect on text
    const handleMouseMove = (e) => {
      if (!containerRef.current || !textRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Calculate rotation based on distance from center
      const rotateX = ((mouseY - centerY) / height) * -20;
      const rotateY = ((mouseX - centerX) / width) * 20;
      
      gsap.to(textRef.current, {
        rotateX,
        rotateY,
        x: ((mouseX - centerX) / width) * -30,
        y: ((mouseY - centerY) / height) * -30,
        transformPerspective: 1000,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(textRef.current, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      floatAnim.kill();
      scrollFadeAnim.kill();
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="hero"
    >
      <div className="hero-content">
        <h1 ref={textRef} className="hero-title">
          Meow!!
        </h1>
      </div>
    </section>
  );
}
