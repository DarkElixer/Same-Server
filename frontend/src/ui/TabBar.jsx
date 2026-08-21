import { NavLink } from "react-router-dom";
import { PiFilmSlateFill, PiHeartFill, PiHouseFill, PiTelevisionSimpleFill } from "react-icons/pi";
import styled from "styled-components";
import { glassHi } from "../styles/mixins";

const Bar = styled.nav`
  display: none;

  @media (max-width: 768px) {
    ${glassHi}
    display: flex;
    justify-content: space-around;
    position: fixed;
    left: 1.6rem;
    right: 1.6rem;
    bottom: 1.6rem;
    padding: 1rem 0.6rem;
    border-radius: ${({ theme }) => theme.radii.xl};
    z-index: 1500;
  }
`;

const Item = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  font: 500 1rem/1 "Manrope", sans-serif;
  color: ${({ theme }) => theme.colors.muted};

  svg {
    font-size: 2rem;
  }

  &.active {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 700;

    svg {
      color: ${({ theme }) => theme.colors.accentSoft};
    }
  }
`;

function TabBar() {
  return (
    <Bar aria-label="Primary">
      <Item to="/" end>
        <PiHouseFill />
        Home
      </Item>
      <Item to="/live/categories">
        <PiTelevisionSimpleFill />
        Live
      </Item>
      <Item to="/vod/categories">
        <PiFilmSlateFill />
        Movies
      </Item>
      <Item to="/my-list">
        <PiHeartFill />
        My List
      </Item>
    </Bar>
  );
}

export default TabBar;
