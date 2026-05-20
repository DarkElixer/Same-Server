import { getMovieLiveLink } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ReactJwPlayer from "react-jw-player";
import Loader from "../../ui/Loader";
import usePlaybackTracking from "../../hooks/usePlaybackTracking";

const PLAYER_ID = "my-unique-id";

function VodJwPlayer() {
  const { movieName } = useParams();
  const movieId = movieName.split("-").pop();
  const movieTitle = movieName
    .split("-")
    .slice(0, -1)
    .join(" ")
    .replace(/%20/g, " ");
  const { data: movieLink, isLoading } = useQuery({
    queryKey: ["movieLink", movieId],
    queryFn: () => getMovieLiveLink(movieId),
    cacheTime: Infinity,
  });

  const { handleReady } = usePlaybackTracking({
    playerId: PLAYER_ID,
    contentType: "movie",
    contentId: movieId,
    title: movieTitle || undefined,
    posterUrl: undefined,
  });

  if (isLoading) return <Loader />;
  return (
    <div className="player">
      <ReactJwPlayer
        playerId={PLAYER_ID}
        playerScript="https://content.jwplatform.com/libraries/IDzF9Zmk.js"
        file={`/vod/proxy/master.m3u8?url=${encodeURIComponent(movieLink)}`}
        privacy={true}
        onReady={handleReady}
        image={
          "https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
        }
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

export default VodJwPlayer;
