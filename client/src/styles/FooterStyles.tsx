import styled from 'styled-components';

export const StyledFooter = styled.footer`
  background-color: var(--color-grey-800);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 15vh;
  padding: 2rem;
  color: var(--color-grey-0);
  text-align: center;
`;

export const FooterText = styled.p`
  font-size: 2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const FooterLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: var(--color-brand-200);
  text-decoration: none;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: var(--color-brand-100);
  }
`;

export const LinkedInIcon = styled.img`
  width: 40px;
  height: 40px;
  margin-left: 0.5rem;
  transition: opacity 0.2s ease-in-out;
  border-radius: 50%;

  ${FooterLink}:hover & {
    opacity: 0.8;
  }
`;
