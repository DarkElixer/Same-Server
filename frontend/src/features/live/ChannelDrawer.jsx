import { useState } from "react";
import { PiMagnifyingGlass, PiPlayFill } from "react-icons/pi";
import styled from "styled-components";
import { glassHi, pill, pillOn } from "../../styles/mixins";

const Drawer = styled.aside`
  ${glassHi}
  position: absolute;
  top: 9.6rem;
  bottom: 15rem;
  right: 2.6rem;
  width: 34.6rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 6;

  @media (max-width: 900px) {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 50vh;
    border-radius: ${({ theme }) => theme.radii.xl} ${({ theme }) => theme.radii.xl} 0 0;
  }
`;

const Head = styled.div`
  padding: 1.6rem 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  span:first-child {
    font: 700 1.35rem/1 "Space Grotesk", sans-serif;
  }
`;

const HintLabel = styled.span`
  margin-left: auto;
  font: 600 1rem/1 "Manrope", sans-serif;
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.faint};
`;

const JumpField = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  height: 3.4rem;
  padding: 0 1.2rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.25rem;

  input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.25rem;
    font-family: inherit;

    &::placeholder {
      color: ${({ theme }) => theme.colors.muted};
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.7rem;
`;

const Tab = styled.span`
  ${pill}
  padding: 0.6rem 1.1rem;
  font-size: 1.15rem;
  ${({ $active }) => $active && pillOn}
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1rem;
  border-radius: 1.3rem;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }

  ${({ $active }) =>
    $active &&
    `
    background: linear-gradient(120deg, rgba(124,92,255,.42), rgba(34,211,238,.2));
    border-color: rgba(196,181,253,.5);
    box-shadow: 0 8px 26px rgba(124,92,255,.35);
    &:hover { background: linear-gradient(120deg, rgba(124,92,255,.42), rgba(34,211,238,.2)); }
  `}
`;

const Mark = styled.span`
  width: 3.8rem;
  height: 3.8rem;
  flex-shrink: 0;
  border-radius: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 1.15rem/1 "Space Grotesk", sans-serif;
  background: ${({ $active }) =>
    $active ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.08)"};
  border: 1px solid ${({ $active, theme }) => ($active ? "transparent" : theme.colors.border)};
  color: ${({ theme }) => theme.colors.text};
`;

const Info = styled.div`
  min-width: 0;
  flex: 1;

  div:first-child {
    font: 600 1.25rem/1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  div:last-child {
    font: 400 1.1rem/1.25;
    color: ${({ theme, $active }) => ($active ? "#e2dffa" : theme.colors.muted)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/**
 * Presentational channel switcher ("Zap"). Not wired to live keyboard
 * up/down switching — HlsPlayer binds ArrowUp/Down to volume and
 * LivePlayer has no sibling-channel data to switch between yet.
 */
function ChannelDrawer({ channels = [], activeChannelId, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? channels.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : channels;

  return (
    <Drawer aria-label="Channel switcher">
      <Head>
        <HeadRow>
          <span>Zap</span>
          <HintLabel>&uarr; &darr; TO SWITCH</HintLabel>
        </HeadRow>
        <JumpField>
          <PiMagnifyingGlass />
          <input
            placeholder="Jump to channel"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </JumpField>
        <Tabs>
          <Tab $active>All</Tab>
        </Tabs>
      </Head>
      <List>
        {filtered.map((channel) => {
          const active = channel.id === activeChannelId;
          return (
            <Row key={channel.id} $active={active} onClick={() => onSelect?.(channel)}>
              <Mark $active={active}>{channel.mark}</Mark>
              <Info $active={active}>
                <div>{channel.name}</div>
                <div>{channel.now}</div>
              </Info>
              {active && <PiPlayFill />}
            </Row>
          );
        })}
      </List>
    </Drawer>
  );
}

export default ChannelDrawer;
