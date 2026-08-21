import styled from "styled-components";
import { Link } from "react-router-dom";
import { PiCompassRose } from "react-icons/pi";
import { ctaButton } from "../styles/mixins";

const StyledPage = styled.div`
  position: relative;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.6rem;
  text-align: center;
  padding: 0 2rem;
`;

const Icon = styled(PiCompassRose)`
  font-size: 4.4rem;
  color: ${({ theme }) => theme.colors.accentSoft};
`;

const Code = styled.div`
  font: 800 clamp(4rem, 10vw, 8rem)/1 "Space Grotesk", sans-serif;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
`;

const Para = styled.p`
  font: 400 1.6rem/1.6 "Manrope", sans-serif;
  color: ${({ theme }) => theme.colors.muted};
`;

const StyledLink = styled(Link)`
  ${ctaButton}
`;

function NotFound() {
  return (
    <StyledPage>
      <Icon />
      <Code>404</Code>
      <Para>This page isn&apos;t available.</Para>
      <StyledLink to="/">Go to homepage</StyledLink>
    </StyledPage>
  );
}

export default NotFound;
