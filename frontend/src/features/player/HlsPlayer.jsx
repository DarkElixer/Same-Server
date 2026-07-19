import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Hls from "hls.js";
import styled from "styled-components";

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $fullscreen }) => ($fullscreen ? "100dvh" : "100%")};
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Video = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: ${({ theme }) => theme.colors.background};
`;

const QualityMenu = styled.select`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  background: ${({ theme }) => theme.colors.overlay};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.3rem 0.6rem;
`;

function HlsPlayer(
  { src, poster, autoPlay = true, fullscreen = true, onComplete, onPlay, onReady },
  ref
) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    function handleReady() {
      if (autoPlay) video.play().catch(() => {});
      onReady?.(containerRef.current);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferHole: 3,
        maxBufferLength: 12,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setLevels(data.levels);
        handleReady();
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentLevel(data.level);
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Safari has native HLS support, no hls.js needed
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", handleReady);
      return () => video.removeEventListener("loadedmetadata", handleReady);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  function handleLevelChange(e) {
    const value = Number(e.target.value);
    if (hlsRef.current) hlsRef.current.currentLevel = value;
    setCurrentLevel(value);
  }

  return (
    <PlayerContainer ref={containerRef} $fullscreen={fullscreen}>
      <Video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        onEnded={onComplete}
        onPlay={onPlay}
        x-webkit-airplay="allow"
      />
      {levels.length > 1 && (
        <QualityMenu value={currentLevel} onChange={handleLevelChange}>
          <option value={-1}>Auto</option>
          {levels.map((level, i) => (
            <option key={i} value={i}>
              {level.height}p
            </option>
          ))}
        </QualityMenu>
      )}
    </PlayerContainer>
  );
}

export default forwardRef(HlsPlayer);
