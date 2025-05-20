import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ForbiddenContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ForbiddenTitle = styled.h1`
  font-size: 3rem;
  color: orangered;
`;

export const ForbiddenMessage = styled.h4`
  color: #333;
`;

export const HomeLink = styled(Link)`
  font-size: 1.2rem;
  color: blue;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: darkblue;
  }
`;

export const BackButton = styled.button`
  font-size: 1.2rem;
  color: blue;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: darkblue;
  }
`;
