import styled from "styled-components";

const StyledSelect = styled.select`
  background-color: transparent;
  color: #fb2;
  appearance: base-select;
  padding: 0.5rem 1rem;
  margin: 1rem 0.5rem;
  border-radius: 0;
  @media screen and (max-width: 900px) {
    padding: 1rem;
    font-size: 2.1vw;
  }
  option {
    color: white;
    background-color: black;
    border-radius: 0;
  }
`;

export default StyledSelect;
