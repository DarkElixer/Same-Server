import { getSeriesLiveLink, getSeriesOrMovie } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "../../styles/player.css";
import "../../styles/player_overlay.css";

import ShakaPlayer from "../../ui/ShakaPlayer";
import Loader from "../../ui/Loader";
import CompactEpisodeList from "./CompactEpisodeList";

function SeriesShakaPlayer() {
  const { seriesName, seasonNo, episodeNo } = useParams();
  const [showInfo, setShowInfo] = useState(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [showNextUpPrompt, setShowNextUpPrompt] = useState(false);
  const [promptCountdown, setPromptCountdown] = useState(10);
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
    cacheTime: Infinity,
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
      return {
        id: episode.id,
        number: episode.series_number,
        title: episode.name,
        thumb: episode.stream_icon,
      };
    }
    return null;
  })();

  const handleNextEpisode = useCallback(() => {
    if (nextEpisode) {
      const nextEpisodeUrl = `/series/${seriesName}/${seasonNo}/play/episode-${nextEpisode.number}-${nextEpisode.id}`;
      navigate(nextEpisodeUrl, { replace: true });
      // Reset state for new episode
      setIsAutoPlayActive(false);
      setCountdown(10);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [nextEpisode, seriesName, seasonNo, navigate]);

  const handleCancelAutoPlay = () => {
    setIsAutoPlayActive(false);
    setCountdown(10);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleVideoComplete = useCallback(() => {
    // Hide the prompt if it was showing
    setShowNextUpPrompt(false);

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
  }, [nextEpisode, handleNextEpisode]);

  const handleOnPlay = useCallback(() => {
    setIsAutoPlayActive(false);
    setShowNextUpPrompt(false);
    setPromptCountdown(10);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleTimeUpdate = useCallback(
    ({ currentTime, duration }) => {
      if (!nextEpisode || isAutoPlayActive) return;

      const remainingTime = Math.floor(duration - currentTime);

      // Trigger prompt at exactly 10 seconds remaining
      if (remainingTime > 0 && remainingTime <= 10) {
        if (!showNextUpPrompt) {
          setShowNextUpPrompt(true);
          setPromptCountdown(remainingTime);

          // Start a persistent 1s interval for the countdown
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setPromptCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current);
                handleNextEpisode();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else if (remainingTime > 10 || remainingTime < 0) {
        // Hide if we seek far back or if video restarts
        if (showNextUpPrompt) {
          setShowNextUpPrompt(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }
    },
    [nextEpisode, isAutoPlayActive, showNextUpPrompt, handleNextEpisode]
  );

  const handlePlayerReady = useCallback(() => {
    // Locate the specific player DOM element to mount the portal
    const playerNode = document.getElementById("my-unique-id");
    if (playerNode) {
      setPlayerElement(playerNode);
    }
  }, []);

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

  if (isLoading) return <Loader />;

  // Render Overlay Content via Portal
  const renderOverlays = () => {
    if (!playerElement) return null;

    return createPortal(
      <>
        {/* Episode Info Overlay */}
        <div
          className={`episode-info-overlay ${
            showInfo ? "show" : ""
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

        {/* Next Up Prompt with Autoplay Timer */}
        {showNextUpPrompt && nextEpisode && !isAutoPlayActive && (
          <div className="next-up-prompt">
            <div className="next-up-card" onClick={handleNextEpisode}>
              <div className="next-up-thumb">
                {nextEpisode.thumb ? (
                  <img src={nextEpisode.thumb} alt="" />
                ) : (
                  <div className="next-up-thumb-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                
                {/* Visual Progress Ring */}
                <div className="next-up-timer-ring">
                  <svg viewBox="0 0 36 36">
                    <path
                      className="next-up-ring-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="next-up-ring-progress"
                      strokeDasharray={`${(promptCountdown / 10) * 100}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="next-up-timer-text">{promptCountdown}</span>
                </div>
              </div>

              <div className="next-up-info">
                <div className="next-up-label">Next Episode in {promptCountdown}s</div>
                <div className="next-up-ep-title">
                  Episode {nextEpisode.number}
                </div>
              </div>
              
              <button className="next-up-close" onClick={(e) => {
                e.stopPropagation();
                setShowNextUpPrompt(false);
                if (timerRef.current) clearInterval(timerRef.current);
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
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
          <ShakaPlayer
            playerId="my-unique-id"
            src={seriesLink ? `/vod/proxy/master.m3u8?url=${encodeURIComponent(
              seriesLink
            )}` : null}
            poster={
              "https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
            }
            onComplete={handleVideoComplete}
            onPlay={handleOnPlay}
            onReady={handlePlayerReady}
            onTimeUpdate={handleTimeUpdate}
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

export default SeriesShakaPlayer;
