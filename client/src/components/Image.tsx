import { useState } from 'react';
import {
  ImageContainer,
  StyledImage,
  Placeholder,
} from '../styles/ImageStyles';

interface ImageProps {
  src?: string;
  alt?: string;
  sizes?: string;
}

const Image = ({
  src,
  alt,
  sizes = '100vw',
}: ImageProps): React.ReactElement => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Default image or placeholder if src is undefined
  const imageSrc = src || '/default-placeholder.png';

  // Generate responsive image URLs for different sizes
  const getResponsiveSrc = (url: string) => {
    if (!url.includes('cloudinary')) return url;

    // For Cloudinary URLs, we'll use their transformation API
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const imagePath = url.split('/upload/')[1];

    // Generate different sizes for responsive images
    return {
      small: `${baseUrl}c_scale,w_300,q_auto,f_auto/${imagePath}`,
      medium: `${baseUrl}c_scale,w_600,q_auto,f_auto/${imagePath}`,
      large: `${baseUrl}c_scale,w_900,q_auto,f_auto/${imagePath}`,
    };
  };

  const responsiveSrcs = getResponsiveSrc(imageSrc);

  const handleLoad = (): void => {
    setIsLoaded(true);
  };

  return (
    <ImageContainer>
      <StyledImage
        src={responsiveSrcs.small}
        srcSet={`
          ${responsiveSrcs.small} 300w,
          ${responsiveSrcs.medium} 600w,
          ${responsiveSrcs.large} 900w
        `}
        sizes={sizes}
        alt={alt || 'Image'}
        onLoad={handleLoad}
        $isLoaded={isLoaded}
        loading="lazy"
        decoding="async"
      />
      <Placeholder $isLoaded={isLoaded} data-testid="placeholder" />
    </ImageContainer>
  );
};

export default Image;
