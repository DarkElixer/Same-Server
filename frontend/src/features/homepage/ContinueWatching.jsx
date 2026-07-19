import { Link } from "react-router-dom";
import { PiX } from "react-icons/pi";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getContinueWatching, removeProgress } from "../../util/continueWatching";
import { Heading } from "../../ui/Heading";
import Image from "../../ui/Image";

const Wrapper = styled.div`
  max-width: 1800px;
  margin: 2.4rem auto 0;
  padding: 0 var(--page-px);

  h2 {
    margin: 0 0 1.2rem;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 2rem;
`;

const Card = styled.div`
  position: relative;
  flex: 0 0 220px;
  height: 130px;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (max-width: 600px) {
    flex-basis: 160px;
    height: 95px;
  }
`;

const CardLink = styled(Link)`
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.p`
  position: absolute;
  bottom: 1.2rem;
  left: 0.8rem;
  right: 0.8rem;
  z-index: 101;
  font-size: 1.4rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

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
