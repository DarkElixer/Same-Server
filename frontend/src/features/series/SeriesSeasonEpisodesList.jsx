import { useInfiniteSeriesScrolling } from "./useInfiniteSeriesScrolling";
import { portal } from "../../constants/servicesConstants";
import { getOrignalNmae, preLen } from "../../util/helper";
import { getSeriesOrMovie } from "../../services/apiVod";
import { Fragment, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Heading } from "../../ui/Heading";
import { GridBox } from "../../ui/GridBox";
import { Footer } from "../../ui/Footer";
import { Box } from "../../ui/Box";

import MiniLoader from "../../ui/MiniLoader";
import StyledSelect from "../../ui/Select";
import Loader from "../../ui/Loader";
import Image from "../../ui/Image";
import Group from "../../ui/Group";

function SeriesSeasonEpisodesList() {
  const total_items = useRef(0);
  const { seriesName, seasonNo } = useParams();
  const [sort, setSort] = useState("name-desc");
  const [selectedEpisodeRange, setSelectedEpisodeRange] = useState({
    start: 1,
    end: Infinity,
  });
  console.log(selectedEpisodeRange);
  const seasonNoFromURL = seasonNo.split("-").pop();
  const seriesArray = seriesName.split("-");
  const seriesIdFromURL = seriesArray[seriesArray.length - 1];
  const screenshotsId = seriesArray[seriesArray.length - 2];
  seriesArray.pop();
  const seriesNameAfter = seriesArray.join("-");
  const { ref, data, isFetchingNextPage, status, hasNextPage } =
    useInfiniteSeriesScrolling(
      "series",
      {
        movieId: seriesIdFromURL,
        seasonId: seasonNoFromURL,
        total_items: total_items.current,
      },
      getSeriesOrMovie,
      { sort, selectedEpisodeRange }
    );
  if (status !== "pending") {
    total_items.current = data.pages[0].data[0].series.length ?? 0;
  }
  const categoryName =
    getOrignalNmae(seriesNameAfter) + " " + getOrignalNmae(seasonNo);
  return (
    <>
      <div className="header">
        <div className="top">
          <Heading as="h2" $type="secondary">
            {categoryName}
          </Heading>
          <StyledSelect
            onChange={(e) => {
              setSort(e.target.value);
            }}
            value={sort}
          >
            <option value="name-desc">Sort By Latest Episode</option>
            <option value="name-asc">Sort By Episode Number</option>
          </StyledSelect>
        </div>
        {status !== "pending" && status !== "error" && (
          <Group
            setSelectedEpisodeRange={setSelectedEpisodeRange}
            data={data}
          />
        )}
      </div>
      {status !== "pending" && status !== "error" ? (
        <GridBox>
          {data.pages.map((group, i) => (
            <Fragment key={i}>
              {sort === "name-desc"
                ? group.data.map((series) => (
                    <Box
                      key={series.id}
                      to={`play/episode-${series.series_number}-${series.id}`}
                    >
                      <Image
                        src={`${portal}/stalker_portal/screenshots/${preLen(
                          screenshotsId
                        )}`}
                        altText={series.name}
                      />
                      <p title={series.name}>{series.name}</p>
                    </Box>
                  ))
                : group.data
                    .sort((a, b) =>
                      +a.series_number < +b.series_number ? -1 : 1
                    )
                    .map((series) => (
                      <Box
                        key={series.id}
                        to={`play/episode-${series.series_number}-${series.id}`}
                      >
                        <Image
                          src={`${portal}/stalker_portal/screenshots/${preLen(
                            screenshotsId
                          )}`}
                          altText={series.name}
                        />
                        <p title={series.name}>{series.name}</p>
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

export default SeriesSeasonEpisodesList;
