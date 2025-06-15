import { NavLink, Outlet, useNavigation } from "react-router-dom";
import styled from "styled-components";
import { Heading } from "./Heading";
import Loader from "./Loader";
import Search from "./Search";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem 0rem 0rem;
  position: sticky;
  top: 0;
  border-bottom: 1px solid gray;
  background-color: black;
  z-index: 1000;
`;

function AppLayout() {
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  return (
    <>
      <Header>
        <NavLink to="/">
          <Heading as="h1" $type="main">
            I P T V
          </Heading>
        </NavLink>
        <Search />
      </Header>
      {loading ? <Loader /> : <Outlet />}
    </>
  );
}

export default AppLayout;
