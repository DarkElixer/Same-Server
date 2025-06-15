import styled, { css } from "styled-components";

const styles = {
  main: css`
    font-weight: 800;
    background-image: linear-gradient(to top left, #1e9600, #fff200, #ff0000);
    color: transparent;
    background-clip: text;
    background-size: contain;
    &:hover {
      background-image: linear-gradient(to top left, #ffe000, #799f0c);
    }
  `,
  secondary: css`
    font-weight: 600;
    background-image: linear-gradient(to top left, #1e9600, #fff200, #ff0000);
    color: transparent;
    background-clip: text;
    background-size: contain;
    top: 10rem;
    z-index: 10;

    /*  ------------  */
    @media (max-width: 900px) {
      font-size: 2.1vw;
    }
    @media (max-width: 450px) {
      font-size: 2vw;
    }
  `,
  error: css`
    color: white;
    font-size: 4dvh;
    font-weight: 100;
    text-align: center;
  `,
};
const variation = {
  large: css`
    font-size: 8dvw;
    @media (max-width: 500px) {
      font-size: 4dvw;
    }
  `,
  medium: css`
    font-size: 8dvw;
    @media (max-width: 500px) {
      font-size: 6rem;
    }
  `,
};
export const Heading = styled.h1`
  margin: 0 1rem;
  display: inline-block;
  line-height: 1.6;
  background-color: black;
  flex: 1 1 60%;
  z-index: -1000;
  ${(prop) => styles[prop.$type]}
  ${(prop) => variation[prop.$variation]}
`;
