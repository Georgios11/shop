import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const Article = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: center;
  background-color: var(--color-red-500);
  padding: 2rem;
  border-radius: var(--border-radius-sm);
`;

export const InfoContainer = styled.div`
  margin-bottom: 2rem;
`;

export const DocumentationLink = styled.a`
  color: #007bff;
  text-decoration: underline;
`;

export const LoginInstructions = styled.div`
  margin-bottom: 2rem;

  h4 {
    margin-bottom: 1rem;
  }
`;

export const AccountList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const AccountItem = styled.li`
  margin-bottom: 1rem;
`;

export const ResetInfo = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const WarningMessage = styled.p`
  color: var(--color-red-700);
  margin-top: 1rem;
  word-wrap: break-word;
  max-width: 700px;
`;
