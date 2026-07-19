import { useEffect, useState } from "react";
import { getFavorites } from "../../util/favorites";
import { GridBox } from "../../ui/GridBox";
import { Heading } from "../../ui/Heading";
import { Box } from "../../ui/Box";
import Image from "../../ui/Image";
import FavoriteButton from "../../ui/FavoriteButton";
import NothingFound from "../SearchBar/NothingFound";

function MyList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  function handleToggle() {
    setItems(getFavorites());
  }

  return (
    <>
      <div className="header">
        <Heading as="h2" $type="heading">
          My List
        </Heading>
      </div>
      {items.length === 0 ? (
        <NothingFound />
      ) : (
        <GridBox>
          {items.map((item) => (
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
