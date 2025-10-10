'use client';

import { useEffect, useState } from 'react';

type ScrollProgressProps = {
  color?: string;
  height?: string;
  shadow?: boolean;
};

export function ScrollProgress({
  color = 'bg-blue-500',
  height = 'h-1',
  shadow = true
}: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      
      // Show only when scrolling down
      setIsVisible(window.scrollY > 100);
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 ${height} bg-gray-200 z-50 
      transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}
      ${shadow ? 'shadow-md' : ''}`}>
      <div 
        className={`h-full ${color} transition-all duration-300 ease-out`}
        style={{ 
          width: `${scrollProgress}%`,
          // Smooth width animation
          transitionProperty: 'width',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '150ms'
        }}
      />
    </div>
  );
}
