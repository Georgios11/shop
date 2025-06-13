import React from 'react';
import {
  StyledFooter,
  FooterText,
  FooterLink,
  LinkedInIcon,
} from '../styles/FooterStyles';

const Footer = (): React.ReactElement => {
  return (
    <StyledFooter>
      <FooterText>
        Developed by Georgios Tsompanidis
        <FooterLink
          href="https://www.linkedin.com/in/georgios-tsompanidis/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedInIcon src="/in.png" alt="LinkedIn Profile" />
        </FooterLink>
      </FooterText>
    </StyledFooter>
  );
};

export default Footer;
