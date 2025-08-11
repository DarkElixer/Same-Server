import { getSeriesLiveLink } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import "../../styles/player.css";

import ReactJwPlayer from "react-jw-player";
import Loader from "../../ui/Loader";

function SeriesJwPlayer() {
  const { seriesName, seasonNo, episodeNo } = useParams();
  const seriesIdFromURL = seriesName.split("-").pop();
  const seasonIdFromURL = seasonNo.split("-").pop();
  const episodeIdFromURL = episodeNo.split("-").pop();
  const seriesNoFromURL = episodeNo.split("-")[1];
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

  if (isLoading) return <Loader />;
  return (
    <div className="player">
      <ReactJwPlayer
        playerId="my-unique-id"
        playerScript="https://content.jwplatform.com/libraries/IDzF9Zmk.js"
        file={`/vod/proxy/master.m3u8?url=${encodeURIComponent(seriesLink)}`}
        image={
          "https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
        }
        privacy={true}
        customProps={{
          primary: "html5", // Force HTML5 playback
          hlshtml: true, // Enable native HLS
          skin: {
            name: "netflix",
          },
          preload: "auto", // Preload content to minimize buffering delays
          hlsjsConfig: {
            maxLoadingDelay: 2,
            minAutoBitrate: 0,
            lowLatencyMode: true,
            subtitlePreference: {
              lang: "en-US",
            },
            maxBufferHole: 3, // Start fetching next segment when 3s are left
            maxBufferLength: 12, // Keep 2 full segments (6s * 2)
          },
        }}
      />
    </div>
  );
}

export default SeriesJwPlayer;
