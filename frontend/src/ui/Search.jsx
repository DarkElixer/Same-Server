import { useNavigate } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { useState } from "react";
import styled from "styled-components";

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
  border: 1px solid gray;
  outline: none;
  transition: all 0.5s linear;
  width: 0;
  opacity: 0;
  color: red;
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

function Search() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  function handleSubmit(e) {
    e.preventDefault();
    setInput("");
    navigate(`/search?q=${input.split(" ").join("+")}`);
  }
  return (
    <StyledSearch>
      <form action="" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Search Movie or Series"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
      <SearchIcon />
    </StyledSearch>
  );
}

export default Search;
