import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getAllCategoriesChannel } from "../../services/apiIptv";
import { replaceSpecialChars } from "../../util/helper";
import { portal } from "../../constants/servicesConstants";
import { Heading } from "../../ui/Heading";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";
import VodRowSkeleton from "./VodRowSkeleton";
import { Wrapper, RowHeader, ViewAllLink, Row } from "./homeRowStyles";

const PLACEHOLDER =
  "https://cdn.pixabay.com/photo/2020/11/23/06/21/television-5768804_640.png";

const PosterCard = styled.div`
  position: relative;
  flex: 0 0 160px;
  height: 230px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};

  p {
    position: absolute;
    bottom: 0.6rem;
    left: 0.6rem;
    right: 0.6rem;
    z-index: 101;
    font-size: 1.3rem;
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 600px) {
    flex-basis: 120px;
    height: 175px;
  }
`;

const PosterLink = styled(Link)`
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
`;

function VodRow({ title, categoryId, viewAllLink }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["vodRow", categoryId],
    queryFn: () => getAllCategoriesChannel("vod", categoryId, 1),
    // matches the server's CACHE_TTL.listings — refetching sooner can only
    // return the same cached bytes
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading) return <VodRowSkeleton />;

  const items = data?.data ?? [];
  if (isError || items.length === 0) return null;

  return (
    <Wrapper>
      <RowHeader>
        <Heading as="h2" $type="title">
          {title}
        </Heading>
        {viewAllLink && <ViewAllLink to={viewAllLink}>View All</ViewAllLink>}
      </RowHeader>
      <Row>
        {items.map((series) => {
          const isMovie = series.is_series === "0";
          const url = isMovie
            ? `/movie/play/${replaceSpecialChars(series.name)}-${series.id}`
            : `/series/${replaceSpecialChars(series.name)}-${series.screenshots}-${series.id}`;
          const poster = series.screenshot_uri
            ? `${portal}${series.screenshot_uri}`
            : PLACEHOLDER;
          return (
            <PosterCard key={series.id}>
              <PosterLink to={url}>
                <Image src={poster} altText={series.name} />
                <p>{series.name}</p>
              </PosterLink>
              <FavoriteButton
                item={{
                  id: `vod-${series.id}`,
                  type: isMovie ? "movie" : "series",
                  title: series.name,
                  poster,
                  url,
                }}
              />
            </PosterCard>
          );
        })}
      </Row>
    </Wrapper>
  );
}

export default VodRow;
