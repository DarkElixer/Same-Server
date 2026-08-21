import { PiFilmSlate } from "react-icons/pi";
import styled from "styled-components";
import { Heading } from "../../ui/Heading";

const StyledNothingFound = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  text-align: center;
  height: calc(100dvh - 20rem);
  color: ${({ theme }) => theme.colors.muted};
`;

const IconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6.4rem;
  height: 6.4rem;
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 2.8rem;
  color: ${({ theme }) => theme.colors.faint};
`;

const Message = styled.p`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 40ch;
`;

function NothingFound({ message = "Nothing found here yet." }) {
  return (
    <StyledNothingFound>
      <IconWrap>
        <PiFilmSlate />
      </IconWrap>
      <Heading as="h2" $type="heading">
        Nothing Found
      </Heading>
      <Message>{message}</Message>
    </StyledNothingFound>
  );
}
export default NothingFound;
