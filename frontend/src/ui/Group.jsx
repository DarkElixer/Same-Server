import styled from "styled-components";

const StyledGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin: 0 2rem;
  padding: 0 1rem;
  overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
  & span {
    border: 1px solid #fb2;
    border-radius: 1rem;
    padding: 0.3rem 1.3vh;
    font-weight: 600;
    flex: 0 0 fit-content;
    transition: background 0.2s cubic-bezier(0.445, 0.05, 0.55, 0.95);
    &:hover {
      background-color: #fb1;
      cursor: pointer;
      color: black;
    }
  }
`;

function Group({ setSelectedEpisodeRange, data, sort }) {
  // Get series array - contains actual episode numbers that exist, sorted descending (newest first)
  const epi_arr = data.pages[0].data[0].series;
  const actualEpisodeCount = epi_arr.length;

  // Calculate total pages based on actual episode count (14 per page)
  const totalPages = Math.ceil(actualEpisodeCount / 14);

  // 14 episodes per group (1 page per group)
  const episodesPerGroup = 14;
  const numGroups = Math.ceil(actualEpisodeCount / episodesPerGroup);

  // For display, always show ranges in ascending order (e.g., "1 - 14", "15 - 28")
  // episodes are strings, convert to numbers and sort ascending
  const sortedEpisodesAsc = [...epi_arr].map(Number).sort((a, b) => a - b);

  return (
    <StyledGroup>
      {Array(numGroups)
        .fill(0)
        .map((_, idx) => {
          // Calculate episode indices for this group (in ascending order for display)
          const startIdx = idx * episodesPerGroup;
          const endIdx = Math.min(
            (idx + 1) * episodesPerGroup - 1,
            actualEpisodeCount - 1
          );

          // Get episode numbers for display
          const startEpisode = sortedEpisodesAsc[startIdx];
          const endEpisode = sortedEpisodesAsc[endIdx];

          return (
            <EpisodeRange
              key={idx}
              displayStart={startEpisode}
              displayEnd={endEpisode}
              groupNo={idx + 1}
              numGroups={numGroups}
              totalPages={totalPages}
              sort={sort}
              setSelectedEpisodeRange={setSelectedEpisodeRange}
            />
          );
        })}
    </StyledGroup>
  );
}

function EpisodeRange({
  displayStart,
  displayEnd,
  groupNo,
  numGroups,
  totalPages,
  sort,
  setSelectedEpisodeRange,
}) {
  function handleClick() {
    let pageNo;

    if (sort === "name-asc") {
      // For ascending sort (oldest first):
      // Group 1 (episodes 1-14) = page 1
      pageNo = groupNo;
    } else {
      // For descending sort (newest first):
      // Group 1 (episodes 1-14) = oldest episodes = last page from API
      // We need to invert the group selection
      pageNo = numGroups - groupNo + 1;
    }

    // Each group is exactly 1 page
    setSelectedEpisodeRange({ start: pageNo, end: pageNo });
  }

  return (
    <span onClick={handleClick}>
      {displayStart} - {displayEnd}
    </span>
  );
}

export default Group;
