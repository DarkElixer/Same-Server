import { NavLink, Outlet, useNavigation } from "react-router-dom";
import styled from "styled-components";
import { Heading } from "./Heading";
import Loader from "./Loader";
import Search from "./Search";
import { useEffect, useState } from "react";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 6rem;
  position: sticky;
  top: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 1000;
  transition: all 0.3s ease;
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
              <Heading as="h1" $type="main">
                I P T V
              </Heading>
            ) : (
              <StyledLogo src="/logo.svg" alt="IPTV Logo" />
            )}
          </LogoContainer>
        </NavLink>
        <Search />
      </Header>
      {loading ? <Loader /> : <Outlet />}
    </>
  );
}

export default AppLayout;
