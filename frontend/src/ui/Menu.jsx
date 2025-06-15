import { createContext, useContext, useState } from "react";
import styled from "styled-components";

const StyledOptions = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  width: fit-content;
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
