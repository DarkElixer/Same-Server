import { getMovieLiveLink } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ReactJwPlayer from "react-jw-player";
import PlayerSkeleton from "../../ui/PlayerSkeleton";

function VodJwPlayer() {
  const { movieName } = useParams();
  const movieId = movieName.split("-").pop();
  const { data: movieLink, isLoading } = useQuery({
    queryKey: ["movieLink", movieId],
    queryFn: () => getMovieLiveLink(movieId),
  });

  if (isLoading) return <PlayerSkeleton />;
  return (
    <div className="player">
      <ReactJwPlayer
        playerId="my-unique-id"
        playerScript="https://content.jwplatform.com/libraries/IDzF9Zmk.js"
        file={`/vod/proxy/master.m3u8?url=${encodeURIComponent(movieLink)}`}
        privacy={true}
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
