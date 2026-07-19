import { PiX } from "react-icons/pi";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getContinueWatching, removeProgress } from "../../util/continueWatching";
import { Heading } from "../../ui/Heading";
import Image from "../../ui/Image";
import { Wrapper, Row, Card, CardLink, Title } from "./homeRowStyles";

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  z-index: 101;
  background: ${({ theme }) => theme.colors.accent};
  width: ${({ $pct }) => $pct}%;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  z-index: 102;
  background: ${({ theme }) => theme.colors.overlay};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

function ContinueWatching() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  function handleRemove(e, url) {
    e.preventDefault();
    e.stopPropagation();
    removeProgress(url);
    setItems(getContinueWatching());
  }

  if (items.length === 0) return null;

  return (
    <Wrapper>
      <Heading as="h2" $type="title">
        Continue Watching
      </Heading>
      <Row>
        {items.map((item) => (
          <Card key={item.url}>
            <CardLink to={item.url}>
              <Image src={item.poster} altText={item.title} />
              <Title>{item.title}</Title>
              <ProgressBar
                $pct={Math.min(100, (item.position / item.duration) * 100)}
              />
            </CardLink>
            <RemoveButton
              onClick={(e) => handleRemove(e, item.url)}
              aria-label="Remove from Continue Watching"
            >
              <PiX />
            </RemoveButton>
          </Card>
        ))}
      </Row>
    </Wrapper>
  );
}

export default ContinueWatching;
