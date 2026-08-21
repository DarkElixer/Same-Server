import { useEffect, useState } from "react";
import styled from "styled-components";
import { getFavorites } from "../../util/favorites";
import { GridBox } from "../../ui/GridBox";
import { Heading } from "../../ui/Heading";
import { Box } from "../../ui/Box";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";
import NothingFound from "../SearchBar/NothingFound";
import PageHeader from "../../ui/PageHeader";
import { pill, pillOn } from "../../styles/mixins";

const Filters = styled.div`
  display: flex;
  gap: 0.8rem;
  overflow-x: auto;
  margin-top: 1rem;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterPill = styled.button`
  ${pill}
  ${({ $active }) => $active && pillOn}
  flex: none;
`;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Channels" },
  { key: "movie", label: "Movies" },
  { key: "series", label: "Series" },
];

function MyList() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  function handleToggle() {
    setItems(getFavorites());
  }

  const visible = items.filter((item) => filter === "all" || item.type === filter);

  return (
    <>
      <PageHeader>
        <div className="top">
          <Heading as="h2" $type="heading">
            My List
          </Heading>
        </div>
        {items.length > 0 && (
          <Filters>
            {FILTERS.map((f) => (
              <FilterPill key={f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </FilterPill>
            ))}
          </Filters>
        )}
      </PageHeader>
      {visible.length === 0 ? (
        <NothingFound message="Items you add to My List will show up here." />
      ) : (
        <GridBox>
          {visible.map((item) => (
            <Box
              key={item.id}
              to={item.url}
              $variant={item.type === "live" ? "small" : undefined}
            >
              <Image
                variant={item.type === "live" ? "small" : undefined}
                src={item.poster}
                altText={item.title}
              />
              <p>{item.title}</p>
              <FavoriteButton item={item} onToggle={handleToggle} />
            </Box>
          ))}
        </GridBox>
      )}
    </>
  );
}

export default MyList;
