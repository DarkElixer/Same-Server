import { css } from "styled-components";

export const glass = css`
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: ${({ theme }) => theme.blur.glass};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.glass};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @supports not (backdrop-filter: blur(1px)) {
    background: rgba(20, 20, 32, 0.92);
  }
`;

export const glassHi = css`
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.045));
  backdrop-filter: ${({ theme }) => theme.blur.glass};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.glass};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.glass};

  @supports not (backdrop-filter: blur(1px)) {
    background: rgba(24, 24, 38, 0.94);
  }
`;

export const tile = css`
  position: relative;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.09);
  transition: border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: rgba(196, 181, 253, 0.5);
    box-shadow: ${({ theme }) => theme.shadows.lift};
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: border-color 0.15s linear, box-shadow 0.15s linear;
    &:hover {
      transform: none;
    }
  }
`;

export const pill = css`
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1.4rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  font: 500 1.25rem/1 "Manrope", sans-serif;
  color: #cfcde4;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.09);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
`;

export const pillOn = css`
  ${pill}
  background: linear-gradient(120deg, rgba(124, 92, 255, 0.5), rgba(34, 211, 238, 0.32));
  border-color: rgba(196, 181, 253, 0.55);
  color: #fff;
  box-shadow: 0 6px 22px rgba(124, 92, 255, 0.4);

  &:hover {
    background: linear-gradient(120deg, rgba(124, 92, 255, 0.58), rgba(34, 211, 238, 0.4));
    color: #fff;
  }
`;

export const ctaButton = css`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.2rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  font: 700 1.35rem/1 "Manrope", sans-serif;
  color: ${({ theme }) => theme.colors.textOnLight};
  background: ${({ theme }) => theme.colors.gradientPrimary};
  box-shadow: ${({ theme }) => theme.shadows.cta};
  border: none;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 40px rgba(124, 92, 255, 0.6);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: box-shadow 0.15s linear;
    &:hover {
      transform: none;
    }
  }
`;

export const eyebrow = css`
  font: 600 1rem/1 "Manrope", sans-serif;
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.faint};
`;
