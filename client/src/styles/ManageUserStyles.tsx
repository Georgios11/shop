import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  flex: 1;
  width: 100%;
  height: 100%;
`;

export const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 80%;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 2fr));
    max-width: 90%;
  }

  @media (max-width: 580px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    max-width: 100%;
  }
`;

interface UserProps {
  $isBanned: boolean;
}

export const User = styled.div<UserProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #333333;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: #555555;

    &.email {
      color: #007bff;
      word-break: break-word;
      margin-bottom: 0.5rem;
    }

    &.phone {
      color: #28a745;
      margin-bottom: 0.5rem;
    }

    &.role {
      font-weight: bold;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    &.banned {
      color: ${({ $isBanned }) => ($isBanned ? '#dc3545' : '#28a745')};
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    &.id {
      font-size: 0.6em;
      color: #999;
      word-break: break-word;
    }
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const RoleLink = styled(Link)`
  margin-left: -20px;
  height: 34px;
  padding: 6px 26px;
  font-style: normal;
  font-weight: 500;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  background-color: transparent;
  color: #4d4d4d;

  &.selected {
    text-decoration: none;
    font-weight: bold;
  }
`;

export const ClearLink = styled.button`
  margin-left: -20px;
  height: 34px;
  padding: 6px 26px;
  font-style: normal;
  font-weight: 500;
  border: none;
  border-radius: 5px;
  text-decoration: underline;
  background-color: transparent;
  color: #4d4d4d;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f0f0f0;
    }

    &.update {
      color: #28a745;
    }

    &.delete {
      color: #dc3545;
    }
  }
`;
