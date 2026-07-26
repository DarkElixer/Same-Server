import { useInfiniteScrolling } from "../../hooks/useInfiniteScrolling";
import { getLiveCmdURL, replaceSpecialChars } from "../../util/helper";
import { getAllCategoriesChannel } from "../../services/apiIptv";
import { useParams } from "react-router-dom";
import { Heading } from "../../ui/Heading";
import { Box } from "../../ui/Box";
import GridSkeleton from "../../ui/GridSkeleton";
import { portal } from "../../constants/servicesConstants";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";
import VirtualizedGrid from "../../ui/VirtualizedGrid";

function renderChannel(series) {
  const url = `/live/play/${replaceSpecialChars(series.name)}-${getLiveCmdURL(
    series.cmd
  )}`;
  const poster = `${portal}/stalker_portal/misc/logos/320/${series.logo}`;
  return (
    <Box key={series.id} $variant="small" to={url}>
      <Image variant="small" altText={series.name} src={poster} />
      <p>{series.name}</p>
      <FavoriteButton
        item={{
          id: `live-${series.id}`,
          type: "live",
          title: series.name,
          poster,
          url,
        }}
      />
    </Box>
  );
}

function LiveChannels() {
  const { categoryId } = useParams();
  const categoryIdFromURL = categoryId.split("-").pop();
  const { data, isFetchingNextPage, status, hasNextPage, fetchNextPage } =
    useInfiniteScrolling("live", categoryIdFromURL, getAllCategoriesChannel);
  const categoryName =
    categoryId.slice(0, categoryId.lastIndexOf("-")).toUpperCase() +
    " LIVE CHANNELS";
  return (
    <>
      <div className="header">
        <Heading as="h2" $type="heading">
          {categoryName}
        </Heading>
      </div>
      {status !== "pending" && status !== "error" ? (
        <VirtualizedGrid
          items={data.pages.flatMap((group) => group.data)}
          renderItem={renderChannel}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      ) : (
        <GridSkeleton />
      )}
    </>
  );
}

export default LiveChannels;
