import React, { useState } from 'react';

const COLORS = [
  '#FFFFFF', // White
  '#FFA500', // Orange
  '#9E9E9E', // Grey
  '#8B4513', // Brown
  '#2A2826', // Black (Dark Charcoal)
];

const PawSVG = ({ color, style }) => (
  <svg 
    viewBox="0 0 100 100" 
    style={{ 
      position: 'absolute', 
      width: '45px', 
      height: '45px', 
      opacity: 0.6, 
      transition: 'transform 0.5s ease',
      filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))',
      pointerEvents: 'none',
      ...style 
    }}
  >
    {/* Cat Paw Style: 4 toes + large pad */}
    <g fill={color}>
      <circle cx="25" cy="35" r="8" />
      <circle cx="42" cy="22" r="9" />
      <circle cx="62" cy="22" r="9" />
      <circle cx="78" cy="35" r="8" />
      <path d="M50,45 C35,45 25,55 25,75 C25,85 35,92 50,92 C65,92 75,85 75,75 C75,55 65,45 50,45 Z" />
    </g>
  </svg>
);

const BackgroundPaws = () => {
  // Use lazy initializer for stable random values
  const [pawData] = useState(() => {
    return Array.from({ length: 400 }).map((_, i) => ({ // Massively increased count
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      // Spreading even further to ensure they overlap edges naturally
      top: `${-10 + Math.random() * 120}%`, 
      left: `${-10 + Math.random() * 120}%`,
      rotate: `${Math.random() * 360}deg`,
      scale: 0.5 + Math.random() * 1.5,
    }));
  });

  return (
    <div style={{
      position: 'absolute', 
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1, // Behind the photos in the same container
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
        {pawData.map(paw => (
          <PawSVG 
            key={paw.id} 
            color={paw.color} 
            style={{
              top: paw.top,
              left: paw.left,
              transform: `rotate(${paw.rotate}) scale(${paw.scale})`,
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundPaws;
