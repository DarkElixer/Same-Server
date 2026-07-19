import { PiHeart, PiHeartFill } from "react-icons/pi";
import styled from "styled-components";
import { useState } from "react";
import { isFavorite, toggleFavorite } from "../util/favorites";

const Button = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 101;
  background: ${({ theme }) => theme.colors.overlay};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.6rem;
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
      aria-label={favorited ? "Remove from My List" : "Add to My List"}
    >
      {favorited ? <PiHeartFill /> : <PiHeart />}
    </Button>
  );
}

export default FavoriteButton;
