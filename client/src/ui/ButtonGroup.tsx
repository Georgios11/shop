import styled from 'styled-components';

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: space-between;
  width: 100%;

  & > button {
    flex: 1;
  }
`;

export default ButtonGroup;
