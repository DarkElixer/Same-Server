import { Link, useLoaderData } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PiFilmSlateFill, PiHeart, PiHeartFill, PiPlayFill } from "react-icons/pi";
import styled from "styled-components";
import { getAllCategories, getAllCategoriesChannel } from "../../services/apiIptv";
import { replaceSpecialChars } from "../../util/helper";
import { portal } from "../../constants/servicesConstants";
import { isFavorite, toggleFavorite } from "../../util/favorites";
import { ctaButton, pill } from "../../styles/mixins";
import Error from "../../ui/Error";
import ContinueWatching from "./ContinueWatching";
import MyListPreview from "./MyListPreview";
import VodRow from "./VodRow";
import VodRowSkeleton from "./VodRowSkeleton";

const GENRE_ROW_LIMIT = 5;
const PLACEHOLDER =
  "https://cdn.pixabay.com/photo/2020/11/23/06/21/television-5768804_640.png";

const Hero = styled.div`
  position: relative;
  height: 486px;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  background: ${({ $img }) =>
    $img
      ? `url(${$img}) center/cover no-repeat`
      : "linear-gradient(155deg, rgba(255,255,255,.08), rgba(255,255,255,.02))"};

  @media (max-width: 768px) {
    height: 380px;
  }
`;

const HeroScrim = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(7, 7, 15, 0.94) 15%, rgba(7, 7, 15, 0.5) 55%, transparent),
    ${({ theme }) => theme.colors.overlayBottom};
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 var(--page-px) 4.4rem;
  max-width: 62rem;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;

  @media (max-width: 768px) {
    padding-bottom: 3rem;
    gap: 1rem;
  }
`;

const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1.1rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(124, 92, 255, 0.18);
  border: 1px solid rgba(196, 181, 253, 0.4);
  font: 700 1.05rem/1 "Manrope", sans-serif;
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.colors.accentSoft};
`;

const Label = styled.span`
  font: 600 1.1rem/1 "Manrope", sans-serif;
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.faint};
`;

const Headline = styled.h1`
  font: 800 clamp(2.6rem, 3vw + 1.6rem, 5.4rem) / 1.05 "Space Grotesk", sans-serif;
  letter-spacing: -0.03em;
  background: linear-gradient(100deg, #ffffff, #d7cffe 62%, #9be8f5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-wrap: balance;
`;

const CtaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-top: 0.6rem;
`;

const Cta = styled(Link)`
  ${ctaButton}
`;

const Pill = styled(Link)`
  ${pill}
  padding: 1.2rem 1.8rem;
`;

const PillButton = styled.button`
  ${pill}
  padding: 1.2rem 1.8rem;
  border: 1px solid rgba(255, 255, 255, 0.09);
  font-family: inherit;
`;

function HeroSection({ item }) {
  const [favorited, setFavorited] = useState(() => (item ? isFavorite(item.favId) : false));
  if (!item) return null;

  function handleToggleFavorite() {
    setFavorited(toggleFavorite({ id: item.favId, type: item.type, title: item.title, poster: item.poster, url: item.url }));
  }

  return (
    <Hero $img={item.poster}>
      <HeroScrim />
      <HeroContent>
        <Eyebrow>
          <Badge>New</Badge>
          <Label>MOVIES &amp; SERIES</Label>
        </Eyebrow>
        <Headline>{item.title}</Headline>
        <CtaRow>
          <Cta to={item.url}>
            <PiPlayFill />
            {item.type === "series" ? "Watch" : "Play"}
          </Cta>
          <PillButton onClick={handleToggleFavorite}>
            {favorited ? <PiHeartFill /> : <PiHeart />}
            My List
          </PillButton>
          <Pill to="/vod/categories">
            <PiFilmSlateFill />
            Browse all
          </Pill>
        </CtaRow>
      </HeroContent>
    </Hero>
  );
}

function Home() {
  const data = useLoaderData();
  const { data: vodGenres, isLoading: genresLoading } = useQuery({
    queryKey: ["vodCategories"],
    queryFn: () => getAllCategories("vod"),
    staleTime: Infinity,
  });
  const { data: newlyAdded, isLoading: heroLoading } = useQuery({
    queryKey: ["vodRow", "*"],
    queryFn: () => getAllCategoriesChannel("vod", "*", 1),
    staleTime: 30 * 60 * 1000,
  });

  if (data !== undefined) return <Error />;

  const featured = newlyAdded?.data?.[0];
  const heroItem = featured
    ? {
        title: featured.name,
        type: featured.is_series === "0" ? "movie" : "series",
        poster: featured.screenshot_uri ? `${portal}${featured.screenshot_uri}` : PLACEHOLDER,
        url:
          featured.is_series === "0"
            ? `/movie/play/${replaceSpecialChars(featured.name)}-${featured.id}`
            : `/series/${replaceSpecialChars(featured.name)}-${featured.screenshots}-${featured.id}`,
        favId: `vod-${featured.id}`,
      }
    : null;

  const genreRows = (vodGenres ?? [])
    .filter((genre) => genre.title !== "All")
    .slice(0, GENRE_ROW_LIMIT);

  return (
    <>
      {!heroLoading && <HeroSection item={heroItem} />}
      <ContinueWatching />
      <MyListPreview />
      <VodRow title="Newly Added" categoryId="*" />
      {genresLoading ? (
        <>
          <VodRowSkeleton count={8} />
          <VodRowSkeleton count={8} />
          <VodRowSkeleton count={8} />
        </>
      ) : (
        genreRows.map((genre) => (
          <VodRow
            key={genre.id}
            title={genre.title}
            categoryId={genre.id}
            viewAllLink={`/vod/categories/${replaceSpecialChars(genre.title)}-${genre.id}`}
          />
        ))
      )}
    </>
  );
}

export async function loader() {
  // Fire-and-forget: warming the server session is not a render dependency, so
  // don't make every homepage navigation wait on a round trip.
  fetch("/authenticate").catch((err) => {
    console.error("[Home loader] Session warm error:", err);
  });
}

export default Home;
