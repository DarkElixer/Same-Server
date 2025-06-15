import styled from "styled-components";
import { Heading } from "./Heading";

const StyledError = styled.div`
  position: relative;
  height: calc(100dvh - 15rem);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

function Error() {
  return (
    <StyledError>
      <Heading as="h2" $type="error">
        Something went wrong
        <br />
        Please refresh the page or try after some time
      </Heading>
    </StyledError>
  );
}

export default Error;
