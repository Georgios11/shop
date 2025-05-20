import styled from 'styled-components';

export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
`;

interface StyledImageProps {
  $isLoaded: boolean;
}

export const StyledImage = styled.img<StyledImageProps>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  opacity: ${(props) => (props.$isLoaded ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  box-shadow: var(--shadow-sm);
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
