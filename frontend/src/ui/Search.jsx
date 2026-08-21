import { useNavigate, Link } from "react-router-dom";
import { PiMagnifyingGlassBold, PiX } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled, { css } from "styled-components";
import { useDebounce } from "../hooks/useDebounce";
import { getVodItemBySearch } from "../services/apiVod";
import { replaceSpecialChars } from "../util/helper";
import { glass, glassHi } from "../styles/mixins";

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 1.2rem;
  color: ${({ theme }) => theme.colors.muted};
  transition: color 0.2s ease;

  svg {
    height: 1.8rem;
    width: 1.8rem;
  }

  @media (max-width: 900px) {
    position: static;
    width: 4rem;
    height: 4rem;
    color: ${({ theme }) => theme.colors.text};

    svg {
      width: 2.2rem;
      height: 2.2rem;
    }
  }
`;

const MobileCloseButton = styled(IconButton)`
  @media (max-width: 900px) {
    position: fixed;
    top: 1.4rem;
    right: 1.6rem;
    z-index: 2002;
  }
`;
const Input = styled.input`
  ${glass}
  padding: 0.9rem 3.6rem 0.9rem 1.6rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  outline: none;
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s ease;
  width: 0;
  opacity: 0;
  color: ${({ theme }) => theme.colors.text};
  font-family: "Manrope", sans-serif;
  font-size: 1.3rem;
  font-weight: 400;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accentSoft};
    opacity: 1;
    width: 32rem;
  }
  ${({ $active }) =>
    $active &&
    css`
      opacity: 1;
      width: 32rem;
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.15s linear;
  }

  @media (max-width: 900px) {
    width: 0;

    &:focus {
      width: 0;
    }
    ${({ $active }) =>
      $active &&
      css`
        position: fixed;
        top: 1.4rem;
        left: 1.6rem;
        right: 6rem;
        width: auto !important;
        z-index: 2001;
      `}
  }
`;
const StyledSearch = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover ${Input} {
    opacity: 1;
    width: 32rem;
  }

  @media (max-width: 900px) {
    &:hover ${Input} {
      width: 0;
    }
  }
`;

const Suggestions = styled.ul`
  ${glassHi}
  position: absolute;
  top: calc(100% + 0.8rem);
  right: 0;
  width: 32rem;
  max-height: 60vh;
  overflow-y: auto;
  border-radius: ${({ theme }) => theme.radii.md};
  list-style: none;
  padding: 0.6rem;
  z-index: 2000;

  @media (max-width: 900px) {
    position: fixed;
    top: 6.4rem;
    left: 1.6rem;
    right: 1.6rem;
    width: auto;
    z-index: 2001;
  }
`;

const SuggestionItem = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1rem;
    border-radius: ${({ theme }) => theme.radii.sm};
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;
    font-size: 1.3rem;
  }
  a:hover {
    background: ${({ theme }) => theme.colors.surfaceLight};
  }
  .type {
    flex: none;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 0.3rem 0.8rem;
    border-radius: ${({ theme }) => theme.radii.pill};
    background: rgba(255, 255, 255, 0.08);
    color: ${({ theme }) => theme.colors.accentSoft};
    text-transform: uppercase;
  }
`;

function Search() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(input.trim(), 300);

  const { data: suggestionsData } = useQuery({
    queryKey: ["searchSuggestions", debouncedQuery],
    queryFn: () => getVodItemBySearch("vod", debouncedQuery, 1),
    enabled: debouncedQuery.length > 1,
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  function handleIconClick() {
    if (input.trim()) {
      handleSubmit({ preventDefault: () => {} });
      return;
    }
    setShowSuggestions(true);
    inputRef.current?.focus();
  }

  function handleClose() {
    setShowSuggestions(false);
    setInput("");
    inputRef.current?.blur();
  }

  const suggestions = suggestionsData?.data ?? [];

  return (
    <StyledSearch ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search movies or series"
          value={input}
          $active={showSuggestions}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
      </form>
      {showSuggestions ? (
        <MobileCloseButton type="button" onClick={handleClose} aria-label="Close search">
          <PiX />
        </MobileCloseButton>
      ) : (
        <IconButton type="button" onClick={handleIconClick} aria-label="Search">
          <PiMagnifyingGlassBold />
        </IconButton>
      )}
      {showSuggestions && debouncedQuery.length > 1 && suggestions.length > 0 && (
        <Suggestions>
          {suggestions.map((item) => (
            <SuggestionItem key={item.id}>
              <Link
                to={
                  item.is_series === "0"
                    ? `/movie/play/${replaceSpecialChars(item.name)}-${item.id}`
                    : `/series/${replaceSpecialChars(item.name)}-${item.screenshots}-${item.id}`
                }
                onClick={() => setShowSuggestions(false)}
              >
                <span className="type">
                  {item.is_series === "0" ? "Movie" : "Series"}
                </span>
                {item.name}
              </Link>
            </SuggestionItem>
          ))}
        </Suggestions>
      )}
    </StyledSearch>
  );
}

export default Search;
