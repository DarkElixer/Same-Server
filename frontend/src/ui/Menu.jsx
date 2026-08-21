import { createContext, useContext, useState } from "react";
import styled from "styled-components";
import { glassHi } from "../styles/mixins";

const StyledOptions = styled.div`
  ${glassHi}
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;

const StyledButton = styled.button`
  padding: 0.8rem 1.4rem;
  width: fit-content;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font: 500 1.3rem/1 "Manrope", sans-serif;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const MenuContext = createContext();

function Menu({ children }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <MenuContext.Provider value={{ showOptions, setShowOptions }}>
      {children}
    </MenuContext.Provider>
  );
}
// function SelectedOption({ children }) {
//   const { showOptions, setShowOptions } = useContext(MenuContext);

//   return (
//     <StyledButton onClick={() => setShowOptions(!showOptions)}>
//       {children}
//     </StyledButton>
//   );
// }
function Options({ children }) {
  const { showOptions } = useContext(MenuContext);
  return showOptions && <StyledOptions>{children}</StyledOptions>;
}
function Option({ label }) {
  return <StyledButton>{label}</StyledButton>;
}

Menu.Option = Option;
// Menu.SelectedOption = SelectedOption;
Menu.Options = Options;

export default Menu;
