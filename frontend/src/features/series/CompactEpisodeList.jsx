import { useNavigate } from "react-router-dom";
import { portal } from "../../constants/servicesConstants";
import { preLen } from "../../util/helper";
import Image from "../../ui/Image";
import Group from "../../ui/Group";
import MiniLoader from "../../ui/MiniLoader";

function CompactEpisodeList({
  episodes,
  currentEpisodeId,
  seriesName,
  seasonNo,
  screenshotsId,
  allSeasonData,
  selectedEpisodeRange,
  setSelectedEpisodeRange,
  isPageLoading,
}) {
  const navigate = useNavigate();

  if (!episodes || episodes.length === 0) return null;

  return (
    <div className="compact-episode-list-container">
      <div className="compact-list-header">
        <h3 className="compact-list-title">Episodes</h3>
        {isPageLoading && <MiniLoader />}
      </div>

      {allSeasonData && (
        <div className="compact-pagination">
          <Group
            data={{ pages: [{ data: allSeasonData.data }] }}
            selectedEpisodeRange={selectedEpisodeRange}
            setSelectedEpisodeRange={setSelectedEpisodeRange}
          />
        </div>
      )}

      <div className="compact-episode-grid">
        {episodes.map((episode) => {
          const isCurrent = String(episode.id) === String(currentEpisodeId);
          const episodeUrl = `/series/${seriesName}/${seasonNo}/play/episode-${episode.series_number}-${episode.id}`;

          return (
            <div
              key={episode.id}
              className={`compact-episode-item ${isCurrent ? "active" : ""}`}
              onClick={() => !isCurrent && navigate(episodeUrl)}
            >
              <div className="compact-episode-thumb">
                <Image
                  src={`${portal}/stalker_portal/screenshots/${preLen(
                    screenshotsId
                  )}`}
                  altText={episode.name}
                  loading="lazy"
                />
                {isCurrent && <div className="now-playing-badge">Playing</div>}
              </div>
              <div className="compact-episode-info">
                <span className="compact-episode-number">
                  E{episode.series_number}
                </span>
                <span className="compact-episode-name" title={episode.name}>
                  {episode.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompactEpisodeList;
