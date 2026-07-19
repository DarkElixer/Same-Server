import { getMovieLiveLink } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PlayerSkeleton from "../../ui/PlayerSkeleton";
import HlsPlayer from "../player/HlsPlayer";

function VodPlayer() {
  const { movieName } = useParams();
  const movieId = movieName.split("-").pop();
  const { data: movieLink, isLoading } = useQuery({
    queryKey: ["movieLink", movieId],
    queryFn: () => getMovieLiveLink(movieId),
  });

  if (isLoading) return <PlayerSkeleton />;
  return (
    <HlsPlayer
      src={`/vod/proxy/master.m3u8?url=${encodeURIComponent(movieLink)}`}
      poster="https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
      autoPlay
    />
  );
}

export default VodPlayer;
