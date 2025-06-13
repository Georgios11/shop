import styled, { css } from 'styled-components';

type HeadingLevel = 'h1' | 'h2' | 'h3';

interface HeadingProps {
  as?: HeadingLevel;
}

const Heading = styled.h1<HeadingProps>`
  ${(props) =>
    props.as === 'h1' &&
    css`
      font-size: 3rem;
      font-weight: 600;
    `}
  ${(props) =>
    props.as === 'h2' &&
    css`
      font-size: 2rem;
      font-weight: 600;
    `}
	${(props) =>
    props.as === 'h3' &&
    css`
      font-size: 2rem;
      font-weight: 500;
    `}
	line-height:1.4;
`;

Heading.defaultProps = {
  as: 'h1',
};

export default Heading;
