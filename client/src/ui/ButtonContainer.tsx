import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;

  button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;

    &.update {
      background-color: #007bff;
      color: white;
    }

    &.delete {
      background-color: #dc3545;
      color: white;
    }
  }
`;

export default ButtonContainer;
