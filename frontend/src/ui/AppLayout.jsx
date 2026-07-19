import { NavLink, Outlet, useNavigation } from "react-router-dom";
import { PiHeartFill } from "react-icons/pi";
import styled from "styled-components";
import { Heading } from "./Heading";
import Loader from "./Loader";
import Search from "./Search";
import { useEffect, useState } from "react";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--page-px);
  height: 6rem;
  position: sticky;
  top: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1500;
  transition: all 0.3s ease;

  @media (max-width: 600px) {
    height: 5.5rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const StyledLogo = styled.img`
  height: 3.5rem;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const NavIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 600px) {
    gap: 0.8rem;
  }
`;

const MyListLink = styled(NavLink)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(2rem, 1.5vw + 1rem, 2.4rem);

  &.active {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

function AppLayout() {
  const navigation = useNavigation();
  const [isMobile, setIsMobile] = useState(false);
  const loading = navigation.state === "loading";
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
  return (
    <>
      <Header>
        <NavLink to="/">
          <LogoContainer>
            {!isMobile ? (
              <Heading as="h1" $type="display">
                I P T V
              </Heading>
            ) : (
              <StyledLogo src="/logo.svg" alt="IPTV Logo" />
            )}
          </LogoContainer>
        </NavLink>
        <NavIcons>
          <Search />
          <MyListLink to="/my-list" aria-label="My List">
            <PiHeartFill />
          </MyListLink>
        </NavIcons>
      </Header>
      {loading ? <Loader /> : <Outlet />}
    </>
  );
}

export default AppLayout;
