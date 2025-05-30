import styled from 'styled-components';

interface LogoProps {
  src?: string;
  alt?: string;
}

const StyledLogo = styled.div`
  text-align: center;
`;

const Img = styled.img`
  height: 9.6rem;
  width: auto;
`;

function Logo({ src = '/logo-light.png', alt = 'Logo' }: LogoProps) {
  return (
    <StyledLogo>
      <Img src={src} alt={alt} />
    </StyledLogo>
  );
}

export default Logo;
