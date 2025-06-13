import styled from 'styled-components';

export const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

export const ProfileCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const ImageContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

export const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #007bff;
`;

export const ProfileTitle = styled.h2`
  margin-top: 1rem;
  color: #007bff;
  text-align: center;
`;

export const InfoContainer = styled.div`
  font-size: 16px;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

export const InfoLabel = styled.span`
  font-weight: bold;
  margin-right: 1rem;
  min-width: 80px;
`;

export const InfoValue = styled.span`
  color: #212529;
`;

export const DefaultAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #6c757d;
  margin: 0 auto;
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #ff6b6b;
  transition: color 0.2s;

  &:hover {
    color: #ff5252;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

export const EditButton = styled.button`
  background: #007bff;
  border: none;
  border-radius: 4px;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;
