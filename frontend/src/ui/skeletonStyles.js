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
  background: ${({ theme }) => theme.colors.surfaceRaised};
  background-image: linear-gradient(
    to right,
    ${({ theme }) => theme.colors.surfaceRaised} 0%,
    ${({ theme }) => theme.colors.surfaceRaisedHighlight} 20%,
    ${({ theme }) => theme.colors.surfaceRaised} 40%,
    ${({ theme }) => theme.colors.surfaceRaised} 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 40px;
  animation: ${shimmer} 2s infinite linear;
`;
