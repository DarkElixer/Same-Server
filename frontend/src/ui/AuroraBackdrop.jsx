import styled from "styled-components";

const Wrap = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
`;

function AuroraBackdrop() {
  return (
    <Wrap aria-hidden="true">
      <Blob style={{ width: 900, height: 640, left: -180, top: -240, background: "rgba(124,92,255,.5)" }} />
      <Blob style={{ width: 760, height: 560, right: -160, top: -140, background: "rgba(34,211,238,.3)" }} />
      <Blob style={{ width: 820, height: 520, left: "20%", bottom: -320, background: "rgba(236,72,153,.2)" }} />
    </Wrap>
  );
}

export default AuroraBackdrop;
