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
    font-family: "Wix Madefor Display", sans-serif;
}
/* a{
    color: red;
} */
html {
    box-sizing: border-box;
    font-size: 62.5%; /* 10px */
    line-height: 1;
}
body {
    font-family: "Wix Madefor Display", sans-serif;
    background-color: black;
    color: white;
}
.plyr--video {
    width: 100%;
    object-fit: fill;
}

.video_player {
    position: relative;
    width: 100%;
    height: 100%;
    object-fit: fill;
}
.player{
    place-content: center;
    height: 100vh;
}

.jwplayer{
    margin: 0 auto !important;
    max-height: 100dvh !important;
    
}
.jw-video{
    object-fit: fill !important;
}
a,a:link{
 text-decoration: none;
}

.header{
    background-color: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
    position: sticky;
    top: 5.5rem;
    z-index: 1000;
    padding-bottom: 1rem;
    display: flex;
    flex-direction: column;
}

.top{
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
  --c:no-repeat linear-gradient(#25b09b 0 0);
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
