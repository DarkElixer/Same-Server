import { Link } from "react-router-dom";
import styled from "styled-components";

export const Wrapper = styled.div`
  max-width: 1800px;
  margin: 2.4rem auto 0;
  padding: 0 var(--page-px);

  h2 {
    margin: 0 0 1.2rem;
  }
`;

export const RowHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
`;

export const ViewAllLink = styled(Link)`
  font-size: 1.3rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.muted};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 2rem;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Card = styled.div`
  position: relative;
  flex: 0 0 220px;
  height: 130px;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (max-width: 600px) {
    flex-basis: 160px;
    height: 95px;
  }
`;

export const CardLink = styled(Link)`
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
`;

export const Title = styled.p`
  position: absolute;
  bottom: 1.2rem;
  left: 0.8rem;
  right: 0.8rem;
  z-index: 101;
  font-size: 1.4rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
