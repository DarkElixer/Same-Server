import { NavLink, useLoaderData } from "react-router-dom";
import { generateToken } from "../../services/apiIptv";
import { Heading } from "../../ui/Heading";

import styled from "styled-components";

const StyledItem = styled.div`
  min-height: 50dvh;
  padding: 1rem;
  text-align: center;
  border: 2px solid white;
  border-radius: 1rem;
  place-content: center;
`;

const Link = styled(NavLink)`
  text-decoration: none;
  color: currentColor;
`;

const GridBox = styled.div`
  position: relative;
  margin: 2rem;
  display: grid;
  gap: 5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  align-items: center;
  height: calc(100dvh - 150px);
`;

function Home() {
  const data = useLoaderData();
  if (data !== undefined) return <Error />;
  return (
    <GridBox>
      <Link to="/live/categories">
        <StyledItem>
          <Heading as="h1" $type="main" $variation="medium">
            L I V E
          </Heading>
        </StyledItem>
      </Link>
      <Link to="/vod/categories">
        <StyledItem>
          <Heading as="h1" $type="main" $variation="medium">
            V O D
          </Heading>
        </StyledItem>
      </Link>
    </GridBox>
  );
}
export async function loader() {
  if (!localStorage.token) {
    const data = await generateToken();
    if (data.status === "fail") return data.message;
    localStorage.token = data.token;
  }
}

export default Home;
