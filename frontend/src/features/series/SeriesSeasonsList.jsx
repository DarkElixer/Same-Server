import { useInfiniteSeriesScrolling } from "./useInfiniteSeriesScrolling";
import { portal } from "../../constants/servicesConstants";
import { getOrignalNmae, preLen } from "../../util/helper";
import { getSeriesOrMovie } from "../../services/apiVod";
import { useParams } from "react-router-dom";
import { Heading } from "../../ui/Heading";
import { GridBox } from "../../ui/GridBox";
import { Footer } from "../../ui/Footer";
import { Box } from "../../ui/Box";
import { Fragment, useRef, useState } from "react";

import MiniLoader from "../../ui/MiniLoader";
import StyledSelect from "../../ui/Select";
import Loader from "../../ui/Loader";
import Image from "../../ui/Image";

function SeriesSeasonsList() {
  const total_items = useRef(0);
  const [sort, setSort] = useState("name-desc");
  const { seriesName } = useParams();
  const seriesArray = seriesName.split("-");
  const seriesIdFromURL = seriesArray[seriesArray.length - 1];
  const screenshotsId = seriesArray[seriesArray.length - 2];
  seriesArray.pop();
  const seriesNameAfter = seriesArray.join("-");
  const { ref, data, isFetchingNextPage, status, hasNextPage } =
    useInfiniteSeriesScrolling(
      "series",
      { movieId: seriesIdFromURL, total_items: total_items.current },
      getSeriesOrMovie,
      { sort }
    );
  if (status !== "pending") {
    total_items.current = data.pages[0].total_items ?? 0;
  }
  return (
    <>
      <div className="header">
        <div className="top">
          <Heading as="h2" $type="secondary">
            {getOrignalNmae(seriesNameAfter)}
          </Heading>
          <StyledSelect
            onChange={(e) => setSort(e.target.value)}
            defaultValue={"name-desc"}
          >
            <option value="name-desc">Sort By Latest Season</option>
            <option value="name-asc">Sort By Season Number</option>
          </StyledSelect>
        </div>
      </div>
      {status !== "pending" && status !== "error" ? (
        <GridBox>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {sort === "name-desc"
                ? group.data.map((series) => (
                    <Box
                      key={series.id}
                      to={`season-${series.season_number}-${series.id}`}
                    >
                      <Image
                        src={`${portal}/stalker_portal/screenshots/${preLen(
                          screenshotsId
                        )}`}
                        altText={series.name}
                      />
                      <p className="title">{series.name}</p>
                    </Box>
                  ))
                : group.data
                    .sort((a, b) =>
                      +a.season_number < +b.season_number ? -1 : 1
                    )
                    .map((series) => (
                      <Box
                        key={series.id}
                        to={`season-${series.season_number}-${series.id}`}
                      >
                        <Image
                          src={`${portal}/stalker_portal/screenshots/${preLen(
                            screenshotsId
                          )}`}
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
        <Loader />
      )}
    </>
  );
}

export default SeriesSeasonsList;
