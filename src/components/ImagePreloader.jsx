import { useEffect } from 'react';
import noInternetImage from '../assets/no-internet.png';
import noBlogPic from '../assets/no-blog-pic.png';

/**
 * Preloads critical images so they're available offline
 * This component runs once when the app loads
 */
function ImagePreloader() {
  useEffect(() => {
    // Preload images that need to be available offline
    const imagesToPreload = [
      noInternetImage,
      noBlogPic,
    ];

    imagesToPreload.forEach((imageSrc) => {
      const img = new Image();
      img.src = imageSrc;
      // Store in cache by loading it
      img.onload = () => {
        console.log('Preloaded image:', imageSrc);
      };
      img.onerror = () => {
        console.warn('Failed to preload image:', imageSrc);
      };
    });
  }, []);

  // This component doesn't render anything
  return null;
}

export default ImagePreloader;

