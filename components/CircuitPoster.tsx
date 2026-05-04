'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CircuitPosterProps {
  circuitKey: number;
  className?: string;
  opacity?: number;
}

/**
 * CircuitPoster - Displays high-quality artistic circuit illustrations as immersive backgrounds
 */
export default function CircuitPoster({ circuitKey, className, opacity = 0.4 }: CircuitPosterProps) {
  const [imageSrc, setImageSrc] = useState<string>('/images/circuits/generic.png');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // List of supported high-quality illustrations
    const supportedKeys = [2, 22, 7, 46, 14, 9];
    
    if (supportedKeys.includes(circuitKey)) {
      setImageSrc(`/images/circuits/${circuitKey}.png`);
    } else {
      setImageSrc('/images/circuits/generic.png');
    }
    setIsLoaded(false);
  }, [circuitKey]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      {/* Base overlay to ensure readability */}
      <div className="absolute inset-0 bg-[#0a0c0f]/60 z-10" />
      
      {/* Background Image */}
      <div 
        className={`relative w-full h-full transition-all duration-1000 ease-in-out transform scale-110 ${
          isLoaded ? 'opacity-100 blur-sm brightness-75' : 'opacity-0'
        }`}
        style={{ opacity }}
      >
        <Image
          src={imageSrc}
          alt="Circuit Backdrop"
          fill
          className="object-cover"
          onLoadingComplete={() => setIsLoaded(true)}
          priority
        />
      </div>

      {/* Radial Gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0f] via-transparent to-[#0a0c0f]/40 z-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0a0c0f_100%)] z-20 opacity-80" />
    </div>
  );
}
