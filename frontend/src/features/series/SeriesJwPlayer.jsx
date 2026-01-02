import { getSeriesLiveLink, getSeriesOrMovie } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../../styles/player.css";

import ReactJwPlayer from "react-jw-player";
import Loader from "../../ui/Loader";

function SeriesJwPlayer() {
  const { seriesName, seasonNo, episodeNo } = useParams();
  const [showInfo, setShowInfo] = useState(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  const seriesIdFromURL = seriesName.split("-").pop();
  const seasonIdFromURL = seasonNo.split("-").pop();
  const episodeIdFromURL = episodeNo.split("-").pop();
  const seriesNoFromURL = episodeNo.split("-")[1];

  // Extract series name and episode info for display
  const seriesArray = seriesName.split("-");
  seriesArray.pop(); // Remove ID
  seriesArray.pop();
  const displaySeriesName = seriesArray.join(" ").replace(/%20/g, " ");

  const seasonArray = seasonNo.split("-");
  seasonArray.pop(); // Remove ID
  const displaySeasonName = seasonArray.join(" ").replace(/%20/g, " ");

  const episodeArray = episodeNo.split("-");
  const episodeNumber = episodeArray[1];

  const { data: seriesLink, isLoading } = useQuery({
    queryKey: [
      "seriesLink",
      { seriesIdFromURL, episodeIdFromURL, seasonIdFromURL },
    ],
    queryFn: () =>
      getSeriesLiveLink({
        movieId: seriesIdFromURL,
        seasonId: seasonIdFromURL,
        episodeId: episodeIdFromURL,
        seriesNo: seriesNoFromURL,
      }),
    cacheTime: Infinity,
  });

  // Fetch all episodes for this season to find the next one (Page 1 contains the series array)
  const { data: seasonData } = useQuery({
    queryKey: ["seasonEpisodes", { seriesIdFromURL, seasonIdFromURL }],
    queryFn: () =>
      getSeriesOrMovie({
        movieId: seriesIdFromURL,
        seasonId: seasonIdFromURL,
        total_items: 2000,
        sortType: "name-desc",
        page: 1,
      }),
    staleTime: Infinity,
  });

  // Determine which page the next episode is on
  const nextEpisodePageInfo = (() => {
    if (!seasonData?.data?.[0]?.series) {
      console.log("Debug: seasonData missing series array", seasonData);
      return null;
    }

    // Series array contains all available series NUMBERS (e.g., ["179", "178" ... "1"])
    const allSeriesNumbers = seasonData.data[0].series;
    console.log(
      `Debug: Series Array fetched. Length: ${allSeriesNumbers.length}`
    );

    // Find index of current series number
    const currentIndex = allSeriesNumbers.findIndex(
      (num) => String(num) === String(seriesNoFromURL)
    );
    console.log(
      `Debug: Current SeriesNo ${seriesNoFromURL} found at index ${currentIndex}`
    );

    if (currentIndex !== -1 && currentIndex < allSeriesNumbers.length - 1) {
      if (currentIndex > 0) {
        const nextIndex = currentIndex - 1;
        const nextSeriesNumber = allSeriesNumbers[nextIndex];
        console.log(
          `Debug: Next Episode SeriesNo will be ${nextSeriesNumber} at index ${nextIndex}`
        );

        // Calculate page number (1-based, 14 items per page)
        const nextPage = Math.floor(nextIndex / 14) + 1;
        console.log(`Debug: Next Episode located on page ${nextPage}`);

        return { number: nextSeriesNumber, page: nextPage };
      } else {
        console.log(
          "Debug: Current episode is the latest (index 0). No next episode."
        );
      }
    } else {
      console.log("Debug: Current index is invalid or at end of list.");
    }
    return null;
  })();

  // Fetch data for the page containing the next episode
  const { data: nextPageData } = useQuery({
    queryKey: [
      "nextEpisodePage",
      { seriesIdFromURL, seasonIdFromURL, page: nextEpisodePageInfo?.page },
    ],
    queryFn: () =>
      getSeriesOrMovie({
        movieId: seriesIdFromURL,
        seasonId: seasonIdFromURL,
        sortType: "name-desc",
        page: nextEpisodePageInfo?.page,
        total_items: 14,
      }),
    enabled: !!nextEpisodePageInfo?.page,
    staleTime: Infinity,
    keepPreviousData: true,
  });

  // Extract Final ID from the fetched page
  const nextEpisode = (() => {
    if (!nextEpisodePageInfo) return null;
    if (!nextPageData?.data) {
      console.log("Debug: Pending next page data...");
      return null;
    }

    const targetNumber = String(nextEpisodePageInfo.number);
    const episode = nextPageData.data.find(
      (ep) => String(ep.series_number) === targetNumber
    );

    if (episode) {
      console.log("Debug: Next Episode Object FOUND:", episode);
      return { id: episode.id, number: episode.series_number };
    }
    console.log(
      `Debug: Failed to find episode # ${targetNumber} in fetched page data.`,
      nextPageData.data
    );
    return null;
  })();

  const handleNextEpisode = () => {
    if (nextEpisode) {
      const nextEpisodeUrl = `/series/${seriesName}/${seasonNo}/play/episode-${nextEpisode.number}-${nextEpisode.id}`;
      navigate(nextEpisodeUrl);
      // Reset state for new episode
      setIsAutoPlayActive(false);
      setCountdown(5);
      clearInterval(timerRef.current);
    }
  };

  const handleCancelAutoPlay = () => {
    setIsAutoPlayActive(false);
    setCountdown(10);
    clearInterval(timerRef.current);
  };

  const handleVideoComplete = () => {
    console.log("Debug: Video Complete Triggered");
    console.log("Debug: nextEpisode object:", nextEpisode);

    if (nextEpisode) {
      console.log("Debug: Starting AutoPlay Sequence");
      setIsAutoPlayActive(true);
      setCountdown(10);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          console.log(`Debug: Countdown: ${prev - 1}`);
          if (prev <= 1) {
            console.log("Debug: Timer Finished. Navigating to:", nextEpisode);
            clearInterval(timerRef.current);
            handleNextEpisode();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      console.log("Debug: No next episode found. AutoPlay aborted.");
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div
      className="player-wrapper"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      {/* Episode Info Overlay */}
      <div
        className={`episode-info-overlay ${
          showInfo && !isAutoPlayActive ? "show" : ""
        }`}
      >
        <div className="episode-info-header">
          <div className="episode-info-content">
            <h2 className="episode-series-name">{displaySeriesName}</h2>
            <div className="episode-details">
              <span className="episode-season">{displaySeasonName}</span>
              <span className="episode-separator">•</span>
              <span className="episode-number">Episode {episodeNumber}</span>
            </div>
          </div>

          {nextEpisode && (
            <button className="next-episode-btn" onClick={handleNextEpisode}>
              <span>Next Episode</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 4V20L19 12L5 4Z" fill="currentColor" />
                <path d="M19 4V20H21V4H19Z" fill="currentColor" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Auto Play Overlay */}
      {isAutoPlayActive && nextEpisode && (
        <div className="autoplay-overlay">
          <div className="autoplay-content">
            <div className="autoplay-header">Up Next</div>
            <div className="autoplay-title">Episode {nextEpisode.number}</div>
            <div className="autoplay-timer-container">
              <svg className="autoplay-timer-circle-bg" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <svg className="autoplay-timer-circle" viewBox="0 0 36 36">
                <path
                  strokeDasharray={`${(countdown / 10) * 100}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="autoplay-seconds">{countdown}</div>
            </div>

            <div className="autoplay-actions">
              <button className="autoplay-play-btn" onClick={handleNextEpisode}>
                Play Now
              </button>
              <button
                className="autoplay-cancel-btn"
                onClick={handleCancelAutoPlay}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="player">
        <ReactJwPlayer
          playerId="my-unique-id"
          playerScript="https://content.jwplatform.com/libraries/IDzF9Zmk.js"
          file={`/vod/proxy/master.m3u8?url=${encodeURIComponent(seriesLink)}`}
          image={
            "https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
          }
          onComplete={handleVideoComplete}
          onPlay={() => setIsAutoPlayActive(false)} // Hide overlay if user replays or seeks back
          privacy={true}
          customProps={{
            primary: "html5",
            hlshtml: true,
            skin: {
              name: "netflix",
            },
            preload: "auto",
            hlsjsConfig: {
              maxLoadingDelay: 2,
              minAutoBitrate: 0,
              lowLatencyMode: true,
              subtitlePreference: {
                lang: "en-US",
              },
              maxBufferHole: 3,
              maxBufferLength: 12,
            },
          }}
        />
      </div>
    </div>
  );
}

export default SeriesJwPlayer;
