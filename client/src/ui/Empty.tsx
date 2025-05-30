import styled from 'styled-components';

interface EmptyProps {
  resource: string;
}

const StyledEmpty = styled.p`
  text-align: center;
  font-size: 1.6rem;
  color: var(--color-grey-500);
  margin: 2.4rem 0;
`;

function Empty({ resource }: EmptyProps) {
  return <StyledEmpty>No {resource} could be found.</StyledEmpty>;
}

export default Empty;
