import { Link } from "react-router-dom";
import styled from "styled-components";
import { tile } from "../../styles/mixins";

export const Wrapper = styled.div`
  max-width: 1800px;
  margin: 3.2rem auto 0;
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
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accentSoft};
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 1.6rem;
  overflow-x: auto;
  padding-bottom: 2rem;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Card = styled.div`
  ${tile}
  flex: 0 0 290px;
  height: 164px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  @media (max-width: 600px) {
    flex-basis: 220px;
    height: 124px;
  }
`;

export const CardLink = styled(Link)`
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1.4rem;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text};
`;

export const Title = styled.p`
  position: relative;
  z-index: 2;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Subtitle = styled.p`
  position: relative;
  z-index: 2;
  margin-top: 0.3rem;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
