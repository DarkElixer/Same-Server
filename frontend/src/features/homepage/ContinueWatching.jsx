import { PiX } from "react-icons/pi";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getContinueWatching, removeProgress } from "../../util/continueWatching";
import { Heading } from "../../ui/Heading";
import Image from "../../ui/Image";
import { Wrapper, Row, Card, CardLink, Title, Subtitle } from "./homeRowStyles";

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(0deg, rgba(7, 7, 15, 0.88), transparent 55%);
`;

const ProgressTrack = styled.div`
  position: relative;
  z-index: 2;
  height: 3px;
  margin-top: 0.9rem;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.14);
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.gradientBar};
  width: ${({ $pct }) => $pct}%;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 3;
  background: ${({ theme }) => theme.colors.overlay};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 2.2rem;
  height: 2.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

function minutesLeft(item) {
  const remaining = Math.max(0, (item.duration - item.position) / 60);
  return remaining >= 1 ? `${Math.round(remaining)} min left` : "Almost done";
}

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
              <Scrim />
              <Title>{item.title}</Title>
              <Subtitle>{minutesLeft(item)}</Subtitle>
              <ProgressTrack>
                <ProgressFill $pct={Math.min(100, (item.position / item.duration) * 100)} />
              </ProgressTrack>
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
