import { useNavigate, Link } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled, { css } from "styled-components";
import { useDebounce } from "../hooks/useDebounce";
import { getVodItemBySearch } from "../services/apiVod";
import { replaceSpecialChars } from "../util/helper";

const SearchIcon = styled(BiSearch)`
  height: 4rem;
  width: 4rem;
  cursor: pointer;
  position: absolute;
  right: 0;

  @media (max-width: 900px) {
    width: 2.5rem;
    height: 2.5rem;
  }
`;
const Input = styled.input`
  padding: 1rem 1rem;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  outline: none;
  transition: all 0.5s linear;
  width: 0;
  opacity: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
  font-weight: 400;
  @media (max-width: 900px) {
    padding: 0.5rem;
    font-size: 1.5rem;
  }
  &:focus {
    opacity: 1;
    width: 60vw;
  }
  ${({ $active }) =>
    $active &&
    css`
      opacity: 1;
      width: 60vw;
    `}
  @media (max-width: 900px) {
    &:focus {
      width: calc(100vw - 10rem);
    }
    ${({ $active }) =>
      $active &&
      css`
        width: calc(100vw - 10rem);
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
    width: 60vw;
  }
`;

const Suggestions = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  width: 60vw;
  max-height: 60vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  list-style: none;
  z-index: 2000;

  @media (max-width: 900px) {
    width: calc(100vw - 2rem);
    right: -1rem;
  }
`;

const SuggestionItem = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;
  }
  a:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
  .type {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.muted};
    text-transform: uppercase;
  }
`;

function Search() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  const suggestions = suggestionsData?.data ?? [];

  return (
    <StyledSearch ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Search Movie or Series"
          value={input}
          $active={showSuggestions}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
      </form>
      <SearchIcon onClick={handleSubmit} />
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
