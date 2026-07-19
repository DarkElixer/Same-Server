import styled, { css } from "styled-components";

// Type scale per DESIGN.md: Display 32/Semibold, Heading 20/Medium, Title 16/Medium.
// Sizes are fluid (clamp) so they scale with viewport instead of jumping at breakpoints.
const styles = {
  display: css`
    font-size: clamp(2.2rem, 1.5vw + 1.8rem, 3.2rem);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.accent};
  `,
  heading: css`
    font-size: clamp(1.7rem, 0.8vw + 1.4rem, 2rem);
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  `,
  title: css`
    font-size: clamp(1.4rem, 0.5vw + 1.2rem, 1.6rem);
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  `,
  error: css`
    font-size: clamp(1.5rem, 0.8vw + 1.2rem, 1.8rem);
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
  `,
};

export const Heading = styled.h1`
  margin: 0 1rem;
  display: inline-block;
  line-height: 1.6;
  flex: 1 1 60%;
  ${(prop) => styles[prop.$type]}
`;
