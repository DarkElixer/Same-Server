import { useMemo, useState } from "react";
import { useInfiniteScrolling } from "../../hooks/useInfiniteScrolling";
import { getLiveCmdURL, replaceSpecialChars } from "../../util/helper";
import { getAllCategoriesChannel } from "../../services/apiIptv";
import { useParams } from "react-router-dom";
import { Heading } from "../../ui/Heading";
import GridSkeleton from "../../ui/GridSkeleton";
import VirtualizedGrid from "../../ui/VirtualizedGrid";
import { portal } from "../../constants/servicesConstants";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";
import PageHeader from "../../ui/PageHeader";
import FilterDock from "./FilterDock";
import styled from "styled-components";
import { eyebrow, tile } from "../../styles/mixins";

const Eyebrow = styled.span`
  ${eyebrow}
`;

const Headline = styled(Heading)`
  font-family: "Space Grotesk", sans-serif;
`;

const Tile = styled.div`
  ${tile}
  display: flex;
  align-items: center;
  gap: 1.4rem;
  padding: 1.4rem;
  color: inherit;
`;

const Mark = styled.span`
  flex: none;
  width: 5.4rem;
  height: 5.4rem;
  border-radius: 1.2rem;
  overflow: hidden;
  background: linear-gradient(150deg, rgba(196, 181, 253, 0.32), rgba(34, 211, 238, 0.16));
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 1.5rem/1 "Space Grotesk", sans-serif;
  color: #efecff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Name = styled.p`
  min-width: 0;
  font: 600 1.4rem/1.25 "Manrope", sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function renderChannel(series) {
  const url = `/live/play/${replaceSpecialChars(series.name)}-${getLiveCmdURL(
    series.cmd
  )}`;
  const poster = `${portal}/stalker_portal/misc/logos/320/${series.logo}`;
  return (
    <Tile key={series.id} as="a" href={url}>
      <Mark>
        <Image altText={series.name} src={poster} />
      </Mark>
      <Name>{series.name}</Name>
      <FavoriteButton
        item={{
          id: `live-${series.id}`,
          type: "live",
          title: series.name,
          poster,
          url,
        }}
      />
    </Tile>
  );
}

function LiveChannels() {
  const { categoryId } = useParams();
  const categoryIdFromURL = categoryId.split("-").pop();
  const categoryName = categoryId.slice(0, categoryId.lastIndexOf("-")).toUpperCase();
  const { data, isFetchingNextPage, status, hasNextPage, fetchNextPage } =
    useInfiniteScrolling("live", categoryIdFromURL, getAllCategoriesChannel);

  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const allChannels = useMemo(
    () => (status !== "pending" && status !== "error" ? data.pages.flatMap((group) => group.data) : []),
    [data, status]
  );
  const totalCount = data?.pages?.[0]?.total_items ?? allChannels.length;

  const visibleChannels = useMemo(() => {
    const filtered = search.trim()
      ? allChannels.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
      : allChannels;
    if (!sortAsc) return filtered;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [allChannels, search, sortAsc]);

  // sorting/filtering only applies to channels already fetched — infinite scroll still
  // loads more of the unsorted backend order underneath.
  const isFiltering = Boolean(search.trim()) || sortAsc;

  return (
    <>
      <PageHeader>
        <div className="top">
          <div>
            <Eyebrow>LIVE TV · {categoryName}</Eyebrow>
            <Headline as="h2" $type="heading">
              {totalCount} channels on air
            </Headline>
          </div>
        </div>
      </PageHeader>
      {status !== "pending" && status !== "error" ? (
        <>
          <FilterDock
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={`Search in ${categoryName}`}
            sortAsc={sortAsc}
            onToggleSort={() => setSortAsc((v) => !v)}
          />
          <VirtualizedGrid
            items={visibleChannels}
            renderItem={renderChannel}
            hasNextPage={!isFiltering && hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        </>
      ) : (
        <GridSkeleton />
      )}
    </>
  );
}

export default LiveChannels;
