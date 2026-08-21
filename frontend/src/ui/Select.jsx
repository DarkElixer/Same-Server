import styled from "styled-components";

const StyledSelect = styled.select`
  background-color: rgba(255, 255, 255, 0.06);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 0.6rem 1.2rem;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accentSoft};
  }

  @media (max-width: 600px) {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
  }

  option {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

export default StyledSelect;
