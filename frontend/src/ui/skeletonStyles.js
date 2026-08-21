import styled, { keyframes } from "styled-components";

export const shimmer = keyframes`
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
`;

export const SkeletonBlock = styled.div`
  background: rgba(255, 255, 255, 0.06);
  background-image: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.14) 20%,
    rgba(255, 255, 255, 0.06) 40%,
    rgba(255, 255, 255, 0.06) 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 40px;
  animation: ${shimmer} 2s infinite linear;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-image: none;
    background-color: rgba(255, 255, 255, 0.09);
  }
`;
