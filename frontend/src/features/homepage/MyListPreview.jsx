import styled from "styled-components";
import { useEffect, useState } from "react";
import { getFavorites } from "../../util/favorites";
import { Heading } from "../../ui/Heading";
import FavoriteButton from "../../ui/FavoriteButton";
import Image from "../../ui/Image";
import { Wrapper, RowHeader, ViewAllLink, Row, Card, CardLink, Title } from "./homeRowStyles";

const PREVIEW_LIMIT = 10;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(0deg, rgba(7, 7, 15, 0.88), transparent 55%);
`;

function MyListPreview() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  function handleToggle() {
    setItems(getFavorites());
  }

  if (items.length === 0) return null;

  return (
    <Wrapper>
      <RowHeader>
        <Heading as="h2" $type="title">
          My List
        </Heading>
        <ViewAllLink to="/my-list">View All</ViewAllLink>
      </RowHeader>
      <Row>
        {items.slice(0, PREVIEW_LIMIT).map((item) => (
          <Card key={item.id}>
            <CardLink to={item.url}>
              <Image src={item.poster} altText={item.title} />
              <Scrim />
              <Title>{item.title}</Title>
            </CardLink>
            <FavoriteButton item={item} onToggle={handleToggle} />
          </Card>
        ))}
      </Row>
    </Wrapper>
  );
}

export default MyListPreview;
