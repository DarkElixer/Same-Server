import styled from "styled-components";

export const GridBox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 300px;
  gap: 1.6rem;
  max-width: 1800px;
  margin: 2.4rem auto;
  padding: 0 var(--page-px);

  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    grid-auto-rows: 220px;
    gap: 1rem;
  }
`;
