import { getLiveChannelLink } from "../../services/apiLive";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PlayerSkeleton from "../../ui/PlayerSkeleton";
import HlsPlayer from "../player/HlsPlayer";

function LivePlayer() {
  const { channelname } = useParams();
  const channelId = channelname.split("-").pop();
  const { data, isLoading } = useQuery({
    queryKey: ["channelLink", channelname],
    queryFn: () => getLiveChannelLink(`ffrt http://localhost/ch/${channelId}`),
  });
  if (isLoading) return <PlayerSkeleton />;
  const channelLink = data?.data;
  return (
    <HlsPlayer
      src={`/live/proxy/master.m3u8?url=${encodeURIComponent(channelLink)}`}
      poster="https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
      autoPlay
    />
  );
}

export default LivePlayer;
