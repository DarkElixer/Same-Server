import { Link } from "react-router-dom";
import styled from "styled-components";

export const Box = styled(Link)`
  display: inline-block;
  position: relative;
  margin: 2rem;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: scale 0.5s ease-in-out;
  color: white;
  &:hover {
    scale: 1.1;
  }
  & p {
    position: absolute;
    width: 100%;
    bottom: 1rem;
    text-align: center;
    padding: 0 0.5rem;
    font-size: 2.5vh;
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
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;
