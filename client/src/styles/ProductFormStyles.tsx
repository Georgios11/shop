import styled from 'styled-components';

export const FormContainer = styled.form`
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  > *:last-child {
    grid-column: 1 / -1;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
  background-color: var(--gray-100);
  &:focus {
    border-color: #3b82f6;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
  background-color: var(--gray-100);

  &:focus {
    border-color: #3b82f6;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
  background-color: var(--gray-100);

  &:focus {
    border-color: #3b82f6;
  }
`;

export const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
`;

export const ImagePreview = styled.img`
  margin-top: 0.5rem;
  width: 8rem;
  height: 8rem;
  object-fit: cover;
  border-radius: 0.5rem;
`;

export const SubmitButton = styled.button`
  width: 100%;
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;
