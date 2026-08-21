import { PiHeart, PiHeartFill } from "react-icons/pi";
import styled from "styled-components";
import { useState } from "react";
import { isFavorite, toggleFavorite } from "../util/favorites";

const Button = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 101;
  background: ${({ theme }) => theme.colors.surfaceLight};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ $favorited, theme }) => ($favorited ? theme.colors.accentSoft : theme.colors.text)};
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    transform: scale(1.08);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background 0.15s linear, color 0.15s linear;
    &:hover {
      transform: none;
    }
  }
`;

function FavoriteButton({ item, onToggle }) {
  const [favorited, setFavorited] = useState(() => isFavorite(item.id));

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(item);
    setFavorited(newState);
    onToggle?.(newState, item);
  }

  return (
    <Button
      onClick={handleClick}
      $favorited={favorited}
      aria-label={favorited ? "Remove from My List" : "Add to My List"}
    >
      {favorited ? <PiHeartFill /> : <PiHeart />}
    </Button>
  );
}

export default FavoriteButton;
