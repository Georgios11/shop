import { useState } from 'react';
import {
  ImageContainer,
  StyledImage,
  Placeholder,
} from '../styles/ImageStyles';

interface ImageProps {
  src?: string;
  alt?: string;
}

const Image = ({ src, alt }: ImageProps): React.ReactElement => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Default image or placeholder if src is undefined
  const imageSrc = src || '/default-placeholder.png'; // Add a default image path

  const handleLoad = (): void => {
    setIsLoaded(true);
  };

  return (
    <ImageContainer>
      <StyledImage
        src={imageSrc}
        alt={alt || 'Image'}
        onLoad={handleLoad}
        $isLoaded={isLoaded}
      />
      <Placeholder $isLoaded={isLoaded} data-testid="placeholder" />
    </ImageContainer>
  );
};

export default Image;
