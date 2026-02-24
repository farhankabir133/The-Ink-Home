import React, { useEffect, useState } from 'react';

/**
 * Sticky reading progress bar that appears at the top of the page
 * and fills as the user scrolls through the content
 */
const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;

      // Calculate progress percentage
      const scrollProgress = (scrollTop / documentHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));

      // Show progress bar only when user has scrolled a bit
      setIsVisible(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      id="reading-progress-bar" 
      className={isVisible ? 'visible' : ''}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div 
        id="reading-progress-fill" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;
