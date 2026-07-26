import styled, { css } from "styled-components";

// Type scale per DESIGN.md: Display 32/Semibold, Heading 20/Medium, Title 16/Medium.
// Sizes are fluid (clamp) so they scale with viewport instead of jumping at breakpoints.
const styles = {
  display: css`
    font-size: clamp(2rem, 1.2vw + 1.5rem, 2.8rem);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.accent};
  `,
  heading: css`
    font-size: clamp(1.4rem, 0.6vw + 1.1rem, 1.8rem);
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  `,
  title: css`
    font-size: clamp(1.3rem, 0.4vw + 1.1rem, 1.5rem);
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  `,
  error: css`
    font-size: clamp(1.4rem, 0.6vw + 1.1rem, 1.7rem);
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
  `,
};

export const Heading = styled.h1`
  margin: 0;
  display: inline-block;
  line-height: 1.3;
  min-width: 0;
  ${(prop) => styles[prop.$type]}
`;
