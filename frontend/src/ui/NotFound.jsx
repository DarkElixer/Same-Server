import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

const StyledPage = styled.div`
  position: relative;
  background-color: black;
  height: 100dvh;
  color: black;
  padding: 1rem;
`;

const Heading = styled.h1`
  color: white;
  ${(prop) => {
    return (
      prop.as === "h2" &&
      css`
        font-size: 1.35vw;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin: 3vh 0 0 8rem;
      `
    );
  }}
  ${(prop) => {
    return (
      prop.as === "h1" &&
      css`
        font-size: 20vw;
        font-weight: 400;
        letter-spacing: -0.07em;
        margin: 0 8rem;
      `
    );
  }}
`;
const Para = styled.p`
  color: white;
  font-size: 1.95vw;
  font-weight: 400;
  margin: 8rem;
`;

const StyledLink = styled(Link)`
  background-color: #fff;
  border: none;
  border-radius: 50px;
  color: #000;
  cursor: pointer;
  font-family: Madefor, sans-serif;
  font-size: 1.5vw;
  font-weight: 400;
  margin: 2vh -2vw 1.2vh 8rem;
  outline-offset: -1px;
  transition: background-color 0.3s ease;
  white-space: nowrap;
  padding: 1.5rem 3rem;
  &:hover {
    background-color: #166aea;
  }
`;
function NotFound() {
  return (
    <StyledPage>
      <Heading as="h2">ERROR: PAGE NOT FOUND</Heading>
      <Heading as="h1">404</Heading>
      <Para>This page isn't available</Para>
      <StyledLink to={"/"}>Go to Homepage</StyledLink>
    </StyledPage>
  );
}

export default NotFound;
