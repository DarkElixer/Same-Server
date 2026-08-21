import { NavLink, Outlet, useNavigation } from "react-router-dom";
import { PiHeartFill } from "react-icons/pi";
import { MdCast } from "react-icons/md";
import styled, { css } from "styled-components";
import { pill, pillOn, glassHi } from "../styles/mixins";
import Loader from "./Loader";
import Search from "./Search";
import TabBar from "./TabBar";
import { useEffect, useState } from "react";
import { useScrollDirection } from "../hooks/useScrollDirection";

const Nav = styled.nav`
  ${glassHi}
  position: fixed;
  top: 2.6rem;
  left: 50%;
  transform: translateX(-50%) translateY(${({ $hidden }) => ($hidden ? "-8rem" : "0")});
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1.2rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  z-index: 1500;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.15s linear;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Brand = styled.span`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0 1.2rem 0 0.6rem;
  font: 800 1.3rem/1 "Space Grotesk", sans-serif;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const Dot = styled.span`
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradientBar};
  box-shadow: 0 0 12px rgba(124, 92, 255, 0.9);
`;

const NavItem = styled(NavLink)`
  ${pill}
  &.active {
    ${pillOn}
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 2.2rem;
  background: ${({ theme }) => theme.colors.border};
  margin: 0 0.4rem;
`;

const IconPill = styled.span`
  ${pill}
  padding: 0.8rem;
  font-size: 1.6rem;
`;

const Avatar = styled.span`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradientBar};
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 1.1rem/1 "Space Grotesk", sans-serif;
  color: ${({ theme }) => theme.colors.textOnLight};
`;

const MobileHeader = styled.header`
  display: none;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem var(--page-px) 1rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileBrand = styled(Brand)`
  padding: 0;
`;

const MobileIcons = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const MobileHeartLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  font-size: 2.2rem;
  color: ${({ theme }) => theme.colors.text};

  &.active {
    color: ${({ theme }) => theme.colors.accentSoft};
  }
`;

const PageArea = styled.div`
  @media (max-width: 768px) {
    padding-bottom: 10.4rem;
  }
`;

function AppLayout() {
  const navigation = useNavigation();
  const [isMobile, setIsMobile] = useState(false);
  const { scrollDirection, isScrolled } = useScrollDirection({ collapseThreshold: 50, threshold: 15 });
  const loading = navigation.state === "loading";

  const isHidden = isScrolled && scrollDirection === "down";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-header-top", isMobile ? "9rem" : "8.6rem");
  }, [isMobile]);

  return (
    <>
      <Nav $hidden={isHidden}>
        <Brand>
          <Dot />
          LIVE TV
        </Brand>
        <NavItem to="/" end>
          Home
        </NavItem>
        <NavItem to="/live/categories">Live</NavItem>
        <NavItem to="/vod/categories">Movies &amp; Series</NavItem>
        <NavItem to="/my-list">My List</NavItem>
        <Divider />
        <Search />
        <IconPill as="span" title="Cast">
          <MdCast />
        </IconPill>
        <Avatar>G</Avatar>
      </Nav>
      <MobileHeader>
        <MobileBrand>
          <Dot />
          LIVE TV
        </MobileBrand>
        <MobileIcons>
          <Search />
          <MobileHeartLink to="/my-list" aria-label="My List">
            <PiHeartFill />
          </MobileHeartLink>
        </MobileIcons>
      </MobileHeader>
      <PageArea>{loading ? <Loader /> : <Outlet />}</PageArea>
      <TabBar />
    </>
  );
}

export default AppLayout;
