import styled, { keyframes } from "styled-components";

const spin = keyframes`
     0%,
    100% {
      box-shadow: .2em 0px 0 0px currentcolor;
    }
    12% {
      box-shadow: .2em .2em 0 0 currentcolor;
    }
    25% {
      box-shadow: 0 .2em 0 0px currentcolor;
    }
    37% {
      box-shadow: -.2em .2em 0 0 currentcolor;
    }
    50% {
      box-shadow: -.2em 0 0 0 currentcolor;
    }
    62% {
      box-shadow: -.2em -.2em 0 0 currentcolor;
    }
    75% {
      box-shadow: 0px -.2em 0 0 currentcolor;
    }
    87% {
      box-shadow: .2em -.2em 0 0 currentcolor;
    }
`;
const Spinner = styled.div`
  transform: rotateZ(45deg);
  perspective: 1000px;
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 10rem;
  height: 10rem;
  color: ${({ theme }) => theme.colors.text};

  &::before,
  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
    border-radius: ${({ theme }) => theme.radii.circle};
    transform: rotateX(70deg);
    animation: 1s ${spin} linear infinite;
  }
  &::after {
    color: ${({ theme }) => theme.colors.loaderAccent};
    transform: rotateY(70deg);
    animation-delay: 0.4s;
  }
`;

const StyledLoader = styled.div`
  position: relative;
  height: calc(100dvh - 15rem);
  display: flex;
  justify-content: center;
  align-items: center;
`;
function Loader() {
  return (
    <StyledLoader>
      <Spinner />
    </StyledLoader>
  );
}

export default Loader;
