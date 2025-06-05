import styled from 'styled-components';

export const DashboardSection = styled.section`
  flex: 1;
  display: grid;
  grid-template-columns: 26rem 1fr;
  height: 100vh;
  overflow: hidden;
`;

export const Aside = styled.aside`
  height: 100%;
  background-color: var(--color-grey-400);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const DashBoardNav = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-evenly;
  min-height: 60%;
`;

export const DashboardContainer = styled.div`
  display: grid;
  place-items: center;
`;
