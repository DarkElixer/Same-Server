import { useInfiniteScrolling } from "../../hooks/useInfiniteScrolling";
import { getVodItemBySearch } from "../../services/apiVod";
import { replaceSpecialChars } from "../../util/helper";
import { useSearchParams } from "react-router-dom";
import { GridBox } from "../../ui/GridBox";
import { Heading } from "../../ui/Heading";
import NothingFound from "./NothingFound";
import { Footer } from "../../ui/Footer";
import { Box } from "../../ui/Box";
import { Fragment, useState } from "react";
import styled from "styled-components";

import MiniLoader from "../../ui/MiniLoader";
import GridSkeleton from "../../ui/GridSkeleton";
import { portal } from "../../constants/servicesConstants";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin: 0 0 1rem;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterButton = styled.button`
  padding: 0.5rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.textOnLight : theme.colors.text};
  cursor: pointer;
  font-weight: 600;
  flex: 0 0 fit-content;

  @media (max-width: 600px) {
    padding: 0.5rem 1.2rem;
    font-size: 1.3rem;
  }
`;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "movie", label: "Movies" },
  { key: "series", label: "Series" },
];

function matchesFilter(item, filter) {
  if (filter === "movie") return item.is_series === "0";
  if (filter === "series") return item.is_series !== "0";
  return true;
}

function SearchedItemBox() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [filter, setFilter] = useState("all");
  const { ref, data, isFetchingNextPage, status, hasNextPage } =
    useInfiniteScrolling("vod", query, getVodItemBySearch);
  if (status === "pending") return <GridSkeleton />;
  const total_items = +data.pages[0].total_items;
  return (
    <>
      <div className="header">
        <Heading as="h2" $type="title">
          {`Showing Results for: ${query}`}
        </Heading>
        {total_items !== 0 && (
          <FilterBar>
            {FILTERS.map((f) => (
              <FilterButton
                key={f.key}
                $active={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </FilterButton>
            ))}
          </FilterBar>
        )}
      </div>
      {total_items !== 0 ? (
        <GridBox>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.data
                .filter((series) => matchesFilter(series, filter))
                .map((series) => {
                  const isMovie = series.is_series === "0";
                  const url = isMovie
                    ? `/movie/play/${replaceSpecialChars(series.name)}-${
                        series.id
                      }`
                    : `/series/${replaceSpecialChars(series.name)}-${
                        series.screenshots
                      }-${series.id}`;
                  const poster = `${portal}/${series.screenshot_uri}`;
                  return (
                    <Box key={series.id} to={url}>
                      <Image src={poster} altText={series.name} />
                      <p className="title">{series.name}</p>
                      <FavoriteButton
                        item={{
                          id: `vod-${series.id}`,
                          type: isMovie ? "movie" : "series",
                          title: series.name,
                          poster,
                          url,
                        }}
                      />
                    </Box>
                  );
                })}
            </Fragment>
          ))}
          {hasNextPage ? (
            <Footer>
              <div ref={ref}>{isFetchingNextPage && <MiniLoader />}</div>
            </Footer>
          ) : null}
        </GridBox>
      ) : (
        <NothingFound />
      )}
    </>
  );
}

export default SearchedItemBox;
