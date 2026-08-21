import styled from "styled-components";

export const Footer = styled.footer`
  display: flex;
  justify-content: center;
  margin-bottom: 1.6rem;
  align-items: center;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.muted};
`;
