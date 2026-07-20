import { NavLink, useLoaderData } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PiTelevisionFill, PiFilmSlateFill } from "react-icons/pi";
import { generateToken, getAllCategories } from "../../services/apiIptv";
import { replaceSpecialChars } from "../../util/helper";
import Error from "../../ui/Error";
import ContinueWatching from "./ContinueWatching";
import MyListPreview from "./MyListPreview";
import VodRow from "./VodRow";

const GENRE_ROW_LIMIT = 5;

import styled from "styled-components";

const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 2vw, 1.5rem);
  padding: clamp(3rem, 6vw, 5rem) 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background-color: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  svg {
    font-size: clamp(3.5rem, 5vw, 6rem);
    color: ${({ theme }) => theme.colors.accent};
  }

  span {
    font-size: clamp(1.6rem, 2vw + 1rem, 2.4rem);
    font-weight: 600;
    letter-spacing: 0.3rem;
    text-align: center;
    color: ${({ theme }) => theme.colors.text};
  }

  &:hover {
    transform: translateY(-0.4rem);
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }

  @media (max-width: 600px) {
    &:hover {
      transform: none;
    }
  }
`;

const Link = styled(NavLink)`
  text-decoration: none;
  color: currentColor;
`;

const GridBox = styled.div`
  position: relative;
  max-width: 1800px;
  margin: 2.4rem auto;
  padding: 0 var(--page-px);
  display: grid;
  gap: 2.4rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  align-items: center;

  @media (max-width: 600px) {
    gap: 1.2rem;
  }
`;

function Home() {
  const data = useLoaderData();
  const { data: vodGenres } = useQuery({
    queryKey: ["vodCategories"],
    queryFn: () => getAllCategories("vod"),
    staleTime: Infinity,
  });
  if (data !== undefined) return <Error />;
  const genreRows = (vodGenres ?? [])
    .filter((genre) => genre.title !== "All")
    .slice(0, GENRE_ROW_LIMIT);
  return (
    <>
      <ContinueWatching />
      <MyListPreview />
      <VodRow title="Newly Added" categoryId="*" />
      {genreRows.map((genre) => (
        <VodRow
          key={genre.id}
          title={genre.title}
          categoryId={genre.id}
          viewAllLink={`/vod/categories/${replaceSpecialChars(genre.title)}-${genre.id}`}
        />
      ))}
      <GridBox>
        <Link to="/live/categories">
          <StyledItem>
            <PiTelevisionFill />
            <span>LIVE TV</span>
          </StyledItem>
        </Link>
        <Link to="/vod/categories">
          <StyledItem>
            <PiFilmSlateFill />
            <span>MOVIES & SERIES</span>
          </StyledItem>
        </Link>
      </GridBox>
    </>
  );
}
export async function loader() {
  if (!localStorage.token) {
    const data = await generateToken();
    if (data.status === "fail") return data.message;
  }
}

export default Home;
