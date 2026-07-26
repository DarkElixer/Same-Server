import styled from "styled-components";

const StyledSelect = styled.select`
  background-color: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.sm || "6px"};
  padding: 0.5rem 1rem;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;

  @media (max-width: 600px) {
    padding: 0.4rem 0.8rem;
    font-size: 1.2rem;
  }

  option {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

export default StyledSelect;
