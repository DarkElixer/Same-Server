import styled from "styled-components";

const StyledSelect = styled.select`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.accent};
  appearance: base-select;
  padding: 0.5rem 1rem;
  margin: 1rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.none};
  @media screen and (max-width: 900px) {
    padding: 1rem;
    font-size: 2.1vw;
  }
  option {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.radii.none};
  }
`;

export default StyledSelect;
