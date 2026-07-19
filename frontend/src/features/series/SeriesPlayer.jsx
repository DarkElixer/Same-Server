import { getSeriesLiveLink, getSeriesOrMovie } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../../styles/player_overlay.css";

import HlsPlayer from "../player/HlsPlayer";
import PlayerSkeleton from "../../ui/PlayerSkeleton";
import CompactEpisodeList from "./CompactEpisodeList";

function SeriesPlayer() {
  const { seriesName, seasonNo, episodeNo } = useParams();
  const [showInfo, setShowInfo] = useState(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [playerElement, setPlayerElement] = useState(null);
  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const [selectedEpisodeRange, setSelectedEpisodeRange] = useState({
    start: 1,
    end: 1,
  });

  const navigate = useNavigate();

  const seriesArray = seriesName.split("-");
  const seriesIdFromURL = seriesArray.pop();
  const screenshotsId = seriesArray.pop();
  const displaySeriesName = seriesArray.join(" ").replace(/%20/g, " ");

  const seasonIdFromURL = seasonNo.split("-").pop();
  const episodeIdFromURL = episodeNo.split("-").pop();
  const seriesNoFromURL = episodeNo.split("-")[1];

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
  });

  // Fetch all episodes for this season to find the next one
  const { data: seasonData } = useQuery({
    queryKey: ["seasonEpisodes", { seriesIdFromURL, seasonIdFromURL }],
    queryFn: () =>
      getSeriesOrMovie({
        movieId: seriesIdFromURL,
        seasonId: seasonIdFromURL,
        total_items: 2000, // Fetch large number to ensure we get the series list
        sortType: "name-desc",
        page: 1,
      }),
    staleTime: Infinity,
  });

  // Calculate initial page based on current episode
  useEffect(() => {
    if (seasonData?.data?.[0]?.series) {
      const allSeriesNumbers = seasonData.data[0].series;
      const currentIndex = allSeriesNumbers.findIndex(
        (num) => String(num) === String(seriesNoFromURL)
      );

      if (currentIndex !== -1) {
        const initialPage = Math.floor(currentIndex / 14) + 1;
        setSelectedEpisodeRange({ start: initialPage, end: initialPage });
      }
    }
  }, [seasonData, seriesNoFromURL]);

  // Fetch episodes for the current selected page
  const { data: currentPageData, isLoading: isPageLoading } = useQuery({
    queryKey: [
      "currentPageEpisodes",
      {
        seriesIdFromURL,
        seasonIdFromURL,
        page: selectedEpisodeRange.start,
      },
    ],
    queryFn: () =>
      getSeriesOrMovie({
        movieId: seriesIdFromURL,
        seasonId: seasonIdFromURL,
        page: selectedEpisodeRange.start,
        total_items: 14,
        sortType: "name-desc",
      }),
    enabled: !!selectedEpisodeRange.start,
    staleTime: Infinity,
  });

  // Determine which page the next episode is on
  const nextEpisodePageInfo = (() => {
    if (!seasonData?.data?.[0]?.series) return null;

    // Series array contains all available series NUMBERS (e.g., ["179", "178" ... "1"])
    const allSeriesNumbers = seasonData.data[0].series;

    // Find index of current series number
    const currentIndex = allSeriesNumbers.findIndex(
      (num) => String(num) === String(seriesNoFromURL)
    );

    if (currentIndex !== -1) {
      if (currentIndex > 0) {
        // Since array is descending, the next episode is at the previous index
        const nextIndex = currentIndex - 1;
        const nextSeriesNumber = allSeriesNumbers[nextIndex];

        // Calculate page number (1-based, 14 items per page)
        const nextPage = Math.floor(nextIndex / 14) + 1;

        return { number: nextSeriesNumber, page: nextPage };
      }
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
    if (!nextEpisodePageInfo || !nextPageData?.data) return null;

    const targetNumber = String(nextEpisodePageInfo.number);
    const episode = nextPageData.data.find(
      (ep) => String(ep.series_number) === targetNumber
    );

    if (episode) {
      return { id: episode.id, number: episode.series_number };
    }
    return null;
  })();

  const handleNextEpisode = () => {
    if (nextEpisode) {
      const nextEpisodeUrl = `/series/${seriesName}/${seasonNo}/play/episode-${nextEpisode.number}-${nextEpisode.id}`;
      navigate(nextEpisodeUrl);
      // Reset state for new episode
      setIsAutoPlayActive(false);
      setCountdown(10);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancelAutoPlay = () => {
    setIsAutoPlayActive(false);
    setCountdown(10);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleVideoComplete = () => {
    if (nextEpisode) {
      setIsAutoPlayActive(true);
      setCountdown(10);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleNextEpisode();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const handleMouseMove = () => {
    setShowInfo(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setShowInfo(false);
    }, 3000);
  };

  if (isLoading) return <PlayerSkeleton />;

  // Render Overlay Content via Portal
  const renderOverlays = () => {
    if (!playerElement) return null;

    return createPortal(
      <>
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
                <button
                  className="autoplay-play-btn"
                  onClick={handleNextEpisode}
                >
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
      </>,
      playerElement
    );
  };

  return (
    <div className="player-page-container">
      <div
        className="player-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowInfo(false)}
      >
        <div className="player">
          <HlsPlayer
            src={`/vod/proxy/master.m3u8?url=${encodeURIComponent(seriesLink)}`}
            poster="https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
            autoPlay
            fullscreen={false}
            onComplete={handleVideoComplete}
            onPlay={() => setIsAutoPlayActive(false)}
            onReady={setPlayerElement}
          />
        </div>

        {renderOverlays()}
      </div>

      <CompactEpisodeList
        episodes={currentPageData?.data}
        currentEpisodeId={episodeIdFromURL}
        seriesName={seriesName}
        seasonNo={seasonNo}
        screenshotsId={screenshotsId}
        allSeasonData={seasonData}
        selectedEpisodeRange={selectedEpisodeRange}
        setSelectedEpisodeRange={setSelectedEpisodeRange}
        isPageLoading={isPageLoading}
      />
    </div>
  );
}

export default SeriesPlayer;
