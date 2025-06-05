import styled from 'styled-components';

export const DashboardSection = styled.section`
  flex: 1;
  display: grid;
  grid-template-columns: 26rem 1fr;
`;

export const Aside = styled.aside`
  min-height: 100%;
  background-color: var(--color-grey-800);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const DashBoardNav = styled.nav`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: flex-start;
  gap: 2rem;
  min-height: 60%;
`;

export const DashboardContainer = styled.div`
  display: grid;
  place-items: center;
  overflow-y: auto;
  height: 100vh;
`;

export const ContentContainer = styled.div`
  width: 60%;
  margin: 0 auto;
`;
