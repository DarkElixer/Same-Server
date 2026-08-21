import styled from "styled-components";
import { Link } from "react-router-dom";
import { PiWarningCircle } from "react-icons/pi";
import { ctaButton } from "../styles/mixins";

const StyledError = styled.div`
  position: relative;
  height: calc(100dvh - 15rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.6rem;
  text-align: center;
  padding: 0 2rem;
`;

const Icon = styled(PiWarningCircle)`
  font-size: 4.4rem;
  color: ${({ theme }) => theme.colors.accentSoft};
`;

const Title = styled.h2`
  font: 700 2rem/1.3 "Space Grotesk", sans-serif;
  letter-spacing: -0.02em;
`;

const Message = styled.p`
  font: 400 1.5rem/1.6 "Manrope", sans-serif;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 42ch;
`;

const HomeLink = styled(Link)`
  ${ctaButton}
`;

function Error() {
  return (
    <StyledError>
      <Icon />
      <Title>Something went wrong</Title>
      <Message>Please refresh the page or try again in a moment.</Message>
      <HomeLink to="/">Back to home</HomeLink>
    </StyledError>
  );
}

export default Error;
