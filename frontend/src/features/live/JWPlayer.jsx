import { getLiveChannelLink } from "../../services/apiLive";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ReactJwPlayer from "react-jw-player";
import Loader from "../../ui/Loader";

function JWPlayer() {
  const { channelname } = useParams();
  const channelId = channelname.split("-").pop();
  const { data, isLoading } = useQuery({
    queryKey: ["channelLink", channelname],
    queryFn: () => getLiveChannelLink(`ffrt http://localhost/ch/${channelId}`),
  });
  if (isLoading) return <Loader />;
  const channelLink = data?.data;
  return (
    <div className="player">
      <ReactJwPlayer
        playerId="my-unique-id"
        playerScript="https://content.jwplatform.com/libraries/IDzF9Zmk.js"
        file={channelLink}
        privacy={true}
        image={
          "https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
        }
        customProps={{
          skin: {
            name: "netflix",
          },
          autostart: true,
          mute: false,
          preload: "auto", // Preload content to minimize buffering delays
          bufferLength: 2, // Reduce buffer length for faster playback
          adaptiveStreaming: true, // Enable dynamic bitrate adjustment
          // hlsjsConfig: {
          //   liveSyncDuration: 1,
          //   maxLoadingDelay: 2,
          //   minAutoBitrate: 0,
          //   lowLatencyMode: true,
          //   subtitlePreference: {
          //     lang: "en-US",
          //   },
          //   maxBufferHole: 5, // Start fetching next segment when 3s are left
          //   maxBufferLength: 12, // Keep 2 full segments (6s * 2)
          // },
          hlsjsConfig: {
            maxLoadingDelay: 2,
            minAutoBitrate: 0,
            lowLatencyMode: true,
            subtitlePreference: {
              lang: "en-US",
            },
            maxBufferHole: 5, // Start fetching next segment when 3s are left
            maxBufferLength: 12, // Keep 2 full segments (6s * 2)
          },
        }}
      />
    </div>
  );
}

export default JWPlayer;
