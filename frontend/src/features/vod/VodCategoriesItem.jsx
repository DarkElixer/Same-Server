import { useInfiniteScrolling } from "../../hooks/useInfiniteScrolling";
import { getOrignalNmae, replaceSpecialChars } from "../../util/helper";
import { getAllCategoriesChannel } from "../../services/apiIptv";
import { useParams } from "react-router-dom";
import { GridBox } from "../../ui/GridBox";
import { Heading } from "../../ui/Heading";
import { Footer } from "../../ui/Footer";
import { Box } from "../../ui/Box";
import { Fragment } from "react";
import { portal } from "../../constants/servicesConstants";
import MiniLoader from "../../ui/MiniLoader";
import GridSkeleton from "../../ui/GridSkeleton";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";

function VodCategoriesItem() {
  const { categoryId } = useParams();
  const categoryIdFromURL = categoryId.split("-").pop();
  const { ref, data, isFetchingNextPage, status, hasNextPage } =
    useInfiniteScrolling("vod", categoryIdFromURL, getAllCategoriesChannel);
  return (
    <>
      <div className="header">
        <Heading as="h2" $type="heading">
          {getOrignalNmae(categoryId)}
        </Heading>
      </div>
      {status !== "pending" && status !== "error" ? (
        <GridBox>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.data.map((series) => {
                const isMovie = series.is_series === "0";
                const url = isMovie
                  ? `/movie/play/${replaceSpecialChars(series.name)}-${
                      series.id
                    }`
                  : `/series/${replaceSpecialChars(series.name)}-${
                      series.screenshots
                    }-${series.id}`;
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
        <GridSkeleton />
      )}
    </>
  );
}

export default VodCategoriesItem;
