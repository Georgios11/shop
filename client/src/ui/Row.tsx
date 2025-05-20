import styled, { css } from 'styled-components';

type RowType = 'horizontal' | 'vertical';

interface RowProps {
  type?: RowType;
}

const Row = styled.div<RowProps>`
  display: flex;
  ${(props) =>
    props.type === 'horizontal' &&
    css`
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    `}
  ${(props) =>
    props.type === 'vertical' &&
    css`
      flex-direction: column;
      gap: 1.6rem;
    `}
`;

Row.defaultProps = {
  type: 'vertical',
};

export default Row;
