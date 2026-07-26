import styled from "styled-components";
import { theme } from "../styles/theme";

const StyledGroup = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;

  &::-webkit-scrollbar {
    display: none;
  }
  & span {
    border: 1px solid ${({ theme }) => theme.colors.accent};
    border-radius: ${({ theme }) => theme.radii.pill || "9999px"};
    padding: 0.4rem 1.2rem;
    font-size: 1.3rem;
    font-weight: 600;
    flex: 0 0 fit-content;
    white-space: nowrap;
    transition: all 0.2s ease;

    @media (max-width: 600px) {
      padding: 0.35rem 1rem;
      font-size: 1.2rem;
    }
    &:hover {
      background-color: ${({ theme }) => theme.colors.accentHover};
      cursor: pointer;
      color: ${({ theme }) => theme.colors.textOnLight};
    }
  }
`;

function Group({ setSelectedEpisodeRange, selectedEpisodeRange, data }) {
  const epi_arr = data.pages[0].data[0].series;
  if (!epi_arr || epi_arr.length === 0) return null;

  const pageSize = 14;
  const groupsCount = Math.ceil(epi_arr.length / pageSize);

  // Determine which group is active
  // If start is 1 and end is Infinity, we are viewing everything starting from page 1, so highlight group 1
  const activePage = selectedEpisodeRange.start;

  return (
    <StyledGroup>
      {Array.from({ length: groupsCount }, (_, idx) => {
        const startIdx = idx * pageSize;
        const endIdx = Math.min((idx + 1) * pageSize - 1, epi_arr.length - 1);

        const firstInGroup = epi_arr[startIdx];
        const lastInGroup = epi_arr[endIdx];

        const startLabel = Math.min(firstInGroup, lastInGroup);
        const endLabel = Math.max(firstInGroup, lastInGroup);

        const isSelected = activePage === idx + 1;

        return (
          <EpisodeRange
            key={idx}
            start={startLabel}
            end={endLabel}
            setSelectedEpisodeRange={setSelectedEpisodeRange}
            groupNo={idx + 1}
            isSelected={isSelected}
          />
        );
      })}
    </StyledGroup>
  );
}

function EpisodeRange({
  start,
  end,
  groupNo,
  setSelectedEpisodeRange,
  isSelected,
}) {
  function handleClick() {
    setSelectedEpisodeRange({ start: groupNo, end: groupNo });
  }
  return (
    <span
      style={{
        backgroundColor: isSelected ? theme.colors.accent : "transparent",
        color: isSelected ? theme.colors.textOnLight : "inherit",
      }}
      onClick={handleClick}
    >
      {start} - {end}
    </span>
  );
}
export default Group;
