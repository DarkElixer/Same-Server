import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
}
button{
    font-family: "Poppins", sans-serif;
}
html {
    box-sizing: border-box;
    font-size: 62.5%; /* 10px */
    line-height: 1;
    --page-px: clamp(1.6rem, 4vw, 6rem);
}
body {
    font-family: "Poppins", sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    background-image: radial-gradient(circle at 20% 0%, rgba(42, 125, 143, 0.12), transparent 40%),
        radial-gradient(circle at 90% 20%, rgba(255, 193, 7, 0.06), transparent 35%);
    background-attachment: fixed;
    color: ${({ theme }) => theme.colors.text};
}
.player{
    place-content: center;
    height: 100vh;
}

a,a:link{
 text-decoration: none;
}

.header{
    background-color: ${({ theme }) => theme.colors.glass};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    position: sticky;
    top: 5.5rem;
    z-index: 1000;
    padding: 1.6rem var(--page-px) 1.2rem;
    display: flex;
    flex-direction: column;
}

.top{
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media (max-width: 768px) {
    .top{
        flex-direction: column;
        align-items: start;
        gap: 0.8rem;

        & > {
        flex: 1;
        }
    }
}
#nothing__found{
 object-fit: cover;
 /* width: 100%; */
 mix-blend-mode: color-burn;

}
// mini loader
.loader {
  width: 40px;
  height: 40px;
  position: relative;
  --c:no-repeat linear-gradient(${({ theme }) => theme.colors.loaderGradient} 0 0);
  background:
    var(--c) center/100% 10px,
    var(--c) center/10px 100%;
}
.loader:before {
  content:'';
  position: absolute;
  inset: 0;
  background:
    var(--c) 0    0,
    var(--c) 100% 0,
    var(--c) 0    100%,
    var(--c) 100% 100%;
  background-size: 15.5px 15.5px;
  animation: l16 1.5s infinite cubic-bezier(0.3,1,0,1);
}
@keyframes l16 {
   33%  {inset:-10px;transform: rotate(0deg)}
   66%  {inset:-10px;transform: rotate(90deg)}
   100% {inset:0    ;transform: rotate(90deg)}
}
`;

export default GlobalStyles;
