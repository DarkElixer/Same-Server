import { PiMagnifyingGlass, PiSortAscending } from "react-icons/pi";
import styled from "styled-components";
import { glassHi, pill, pillOn } from "../../styles/mixins";

const Dock = styled.div`
  ${glassHi}
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  margin: 0 var(--page-px) 2rem;
  flex-wrap: wrap;
`;

const SearchField = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
  min-width: 18rem;
  height: 3.6rem;
  padding: 0 1.2rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.5rem;

  svg {
    flex: none;
    font-size: 1.7rem;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text};
  font: 400 1.4rem/1 "Manrope", sans-serif;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const SortButton = styled.button`
  ${pill}
  border: none;
  ${({ $active }) => $active && pillOn}
`;

function FilterDock({ search, onSearchChange, searchPlaceholder = "Search channels", sortAsc, onToggleSort }) {
  return (
    <Dock>
      <SearchField>
        <PiMagnifyingGlass />
        <SearchInput
          type="text"
          value={search}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </SearchField>
      <SortButton type="button" $active={sortAsc} onClick={onToggleSort} aria-pressed={sortAsc}>
        <PiSortAscending />
        A–Z
      </SortButton>
    </Dock>
  );
}

export default FilterDock;
