import styled from "styled-components";
import { Heading } from "../../ui/Heading";

const StyledNothingFound = styled.div`
  text-transform: uppercase;
  letter-spacing: 1rem;
  text-align: center;
  align-content: center;
  height: calc(100dvh - 10rem);
`;
function NothingFound() {
  return (
    <StyledNothingFound>
      <Heading as="h1" $type="main" $variation="large">
        Nothing Found
      </Heading>
    </StyledNothingFound>
  );
}
export default NothingFound;
