import { useInfiniteScrolling } from "../../hooks/useInfiniteScrolling";
import { getOrignalNmae, replaceSpecialChars } from "../../util/helper";
import { getAllCategoriesChannel } from "../../services/apiIptv";
import { useParams } from "react-router-dom";
import { Heading } from "../../ui/Heading";
import { Box } from "../../ui/Box";
import { portal } from "../../constants/servicesConstants";
import GridSkeleton from "../../ui/GridSkeleton";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";
import VirtualizedGrid from "../../ui/VirtualizedGrid";
import PageHeader from "../../ui/PageHeader";

function renderSeries(series) {
  const isMovie = series.is_series === "0";
  const url = isMovie
    ? `/movie/play/${replaceSpecialChars(series.name)}-${series.id}`
    : `/series/${replaceSpecialChars(series.name)}-${series.screenshots}-${
        series.id
      }`;
  const poster = series.screenshot_uri
    ? `${portal}${series.screenshot_uri}`
    : "https://cdn.pixabay.com/photo/2020/11/23/06/21/television-5768804_640.png";
  return (
    <Box key={series.id} to={url}>
      <Image src={poster} altText={series.name} />
      <p title={series.name} aria-label={series.name}>
        {series.name}
      </p>
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
}

function VodCategoriesItem() {
  const { categoryId } = useParams();
  const categoryIdFromURL = categoryId.split("-").pop();
  const { data, isFetchingNextPage, status, hasNextPage, fetchNextPage } =
    useInfiniteScrolling("vod", categoryIdFromURL, getAllCategoriesChannel);
  return (
    <>
      <PageHeader>
        <div className="top">
          <Heading as="h2" $type="heading">
            {getOrignalNmae(categoryId)}
          </Heading>
        </div>
      </PageHeader>
      {status !== "pending" && status !== "error" ? (
        <VirtualizedGrid
          items={data.pages.flatMap((group) => group.data)}
          renderItem={renderSeries}
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

export default VodCategoriesItem;
