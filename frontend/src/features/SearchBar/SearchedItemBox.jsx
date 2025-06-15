import { useInfiniteScrolling } from "../../hooks/useInfiniteScrolling";
import { getVodItemBySearch } from "../../services/apiVod";
import { replaceSpecialChars } from "../../util/helper";
import { useSearchParams } from "react-router-dom";
import { GridBox } from "../../ui/GridBox";
import { Heading } from "../../ui/Heading";
import NothingFound from "./NothingFound";
import { Footer } from "../../ui/Footer";
import { Box } from "../../ui/Box";
import { Fragment } from "react";

import MiniLoader from "../../ui/MiniLoader";
import Loader from "../../ui/Loader";
import { portal } from "../../constants/servicesConstants";
import Image from "../../ui/Image";

function SearchedItemBox() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const { ref, data, isFetchingNextPage, status, hasNextPage } =
    useInfiniteScrolling("vod", query, getVodItemBySearch);
  if (status === "pending") return <Loader />;
  const total_items = +data.pages[0].total_items;
  return (
    <>
      <div className="header">
        <Heading as="h2" $type="secondary" $variation="small">
          {`Showing Results for: ${query}`}
        </Heading>
      </div>
      {total_items !== 0 ? (
        <GridBox>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.data.map((series) => (
                <Box
                  key={series.id}
                  to={
                    series.is_series === "0"
                      ? `/movie/play/${replaceSpecialChars(series.name)}-${
                          series.id
                        }`
                      : `/series/${replaceSpecialChars(series.name)}-${
                          series.screenshots
                        }-${series.id}`
                  }
                >
                  <Image
                    src={`${portal}/${series.screenshot_uri}`}
                    altText={series.name}
                  />
                  <p className="title">{series.name}</p>
                </Box>
              ))}
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
