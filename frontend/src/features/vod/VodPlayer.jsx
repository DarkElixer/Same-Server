import { getMovieLiveLink } from "../../services/apiVod";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { getOrignalNmae } from "../../util/helper";
import {
  getProgress,
  removeProgress,
  saveProgress,
} from "../../util/continueWatching";
import PlayerSkeleton from "../../ui/PlayerSkeleton";
import HlsPlayer from "../player/HlsPlayer";

const POSTER =
  "https://www.tellyupdates.com/wp-content/uploads/2021/08/opinion-the-seasonal-shows-hit-formula-on-indian-tv-920x51801-1.jpg";

function VodPlayer() {
  const { movieName } = useParams();
  const location = useLocation();
  const movieId = movieName.split("-").pop();
  const { data: movieLink, isLoading } = useQuery({
    queryKey: ["movieLink", movieId],
    queryFn: () => getMovieLiveLink(movieId),
  });

  if (isLoading) return <PlayerSkeleton />;

  const resumeKey = location.pathname;
  const saved = getProgress(resumeKey);
  const title = getOrignalNmae(movieName);

  return (
    <HlsPlayer
      src={`/vod/proxy/master.m3u8?url=${encodeURIComponent(movieLink)}`}
      poster={POSTER}
      title={title}
      autoPlay
      initialTime={saved?.position}
      onTimeUpdate={(position, duration) =>
        saveProgress({
          url: resumeKey,
          position,
          duration,
          title,
          poster: POSTER,
          type: "movie",
        })
      }
      onComplete={() => removeProgress(resumeKey)}
    />
  );
}

export default VodPlayer;
