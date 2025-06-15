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

function Group({ setSelectedEpisodeRange, data }) {
  const epi_arr = data.pages[0].data[0].series;
  const last_epi = epi_arr[0];
  const first_epi = epi_arr[epi_arr.length - 1];

  return (
    <StyledGroup>
      {Array(Math.ceil((last_epi - first_epi) / 140))
        .fill(0)
        .map((epi, idx) => (
          <EpisodeRange
            key={idx}
            start={+first_epi + 140 * idx}
            setSelectedEpisodeRange={setSelectedEpisodeRange}
            end={
              last_epi >= +first_epi + 140 * (idx + 1) - 1
                ? +first_epi + 140 * (idx + 1) - 1
                : last_epi
            }
            groupNo={idx + 1}
          />
        ))}
    </StyledGroup>
  );
}

function EpisodeRange({ start, end, groupNo, setSelectedEpisodeRange }) {
  function handleClick() {
    const startPage = 10 * (groupNo - 1) + 1;
    const endPage = startPage + Math.floor((end - start) / 14);
    setSelectedEpisodeRange({ start: startPage, end: endPage });
  }
  return (
    <span onClick={handleClick}>
      {start} - {end}
    </span>
  );
}
export default Group;
