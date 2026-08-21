import { Link } from "react-router-dom";
import styled from "styled-components";
import { tile } from "../styles/mixins";

export const Box = styled(Link)`
  ${tile}
  display: block;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};

  & p {
    position: absolute;
    width: 100%;
    bottom: 1rem;
    text-align: center;
    padding: 0 0.5rem;
    font-size: clamp(1.2rem, 1vw + 0.9rem, 1.4rem);
    font-weight: 500;
    margin: 0.5rem 0;
    z-index: 2;

    // line limit defaults to 2
    text-overflow: ellipsis;
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  @media (max-width: 600px) {
    border-radius: ${({ theme }) => theme.radii.md};

    & p {
      bottom: 0.6rem;
    }
  }
`;
