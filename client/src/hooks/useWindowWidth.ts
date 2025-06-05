import { useState, useEffect } from 'react';

/**
 * A hook that tracks the window's width and updates when it changes.
 * @returns The current window width in pixels
 */
const useWindowWidth = (): number => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowWidth;
};

export default useWindowWidth;
