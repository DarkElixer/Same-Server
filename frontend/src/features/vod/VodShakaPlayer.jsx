import { getMovieLiveLink } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ShakaPlayer from "../../ui/ShakaPlayer";
import Loader from "../../ui/Loader";

function VodShakaPlayer() {
  const { movieName } = useParams();
  const movieId = movieName.split("-").pop();
  const { data: movieLink, isLoading } = useQuery({
    queryKey: ["movieLink", movieId],
    queryFn: () => getMovieLiveLink(movieId),
    cacheTime: Infinity,
  });

  if (isLoading) return <Loader />;
  return (
    <div className="player">
      <ShakaPlayer
        playerId="my-unique-id"
        src={`/vod/proxy/master.m3u8?url=${encodeURIComponent(movieLink)}`}
        poster={
          "https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg"
        }
      />
    </div>
  );
}

export default VodShakaPlayer;
