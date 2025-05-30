import styled from 'styled-components';

export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%; // 4:3 aspect ratio
  overflow: hidden;
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
`;

interface StyledImageProps {
  $isLoaded: boolean;
}

export const StyledImage = styled.img<StyledImageProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  opacity: ${(props) => (props.$isLoaded ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  box-shadow: var(--shadow-sm);
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;

  @media (max-width: 768px) {
    // Optimize for mobile devices
    transform: scale(1.01); // Prevent blurry images on mobile
    -webkit-font-smoothing: antialiased;
  }
`;

interface PlaceholderProps {
  $isLoaded: boolean;
}

export const Placeholder = styled.div<PlaceholderProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-brand-100);
  border-radius: var(--border-radius-sm);
  opacity: ${(props) => (props.$isLoaded ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0% {
      background-color: var(--color-brand-100);
    }
    50% {
      background-color: var(--color-brand-200);
    }
    100% {
      background-color: var(--color-brand-100);
    }
  }
`;
