import { Link } from "react-router-dom";
import styled from "styled-components";

export const Box = styled(Link)`
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    transform: scale(1.05);
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
  & p {
    position: absolute;
    width: 100%;
    bottom: 1rem;
    text-align: center;
    padding: 0 0.5rem;
    font-size: clamp(1.2rem, 1vw + 0.9rem, 1.4rem);
    font-weight: 500;
    margin: 0.5rem 0;
    z-index: 100;

    // line limit defaults to 2
    text-overflow: ellipsis;
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (max-width: 600px) {
    border-radius: ${({ theme }) => theme.radii.md};

    &:hover {
      transform: none;
    }

    & p {
      bottom: 0.6rem;
    }
  }
`;
