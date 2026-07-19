import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import Hls from "hls.js";
import styled, { keyframes } from "styled-components";
import {
  PiPlayFill,
  PiPauseFill,
  PiSpeakerHighFill,
  PiSpeakerLowFill,
  PiSpeakerNoneFill,
  PiArrowsOutSimple,
  PiArrowsInSimple,
  PiPictureInPictureFill,
  PiArrowLeft,
  PiWarningCircleFill,
  PiArrowClockwise,
} from "react-icons/pi";

const HIDE_DELAY = 3000;

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $fullscreen }) => ($fullscreen ? "100dvh" : "100%")};
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: ${({ $showControls }) => ($showControls ? "default" : "none")};
`;

const Video = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: ${({ theme }) => theme.colors.background};
`;

const ControlsOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 35%,
    transparent 65%
  );
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.25s ease;
`;

const Bar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0 1.6rem 1.4rem;

  @media (max-width: 600px) {
    padding: 0 1rem 1rem;
    gap: 0.5rem;
  }
`;

const ScrubTrack = styled.div`
  position: relative;
  height: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  touch-action: none;
`;

const ScrubFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: inherit;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $variant, theme }) =>
    $variant === "buffered" ? "rgba(255, 255, 255, 0.4)" : theme.colors.accent};
`;

const ScrubThumb = styled.div`
  position: absolute;
  top: 50%;
  left: ${({ $pct }) => $pct}%;
  transform: translate(-50%, -50%);
  width: 1.3rem;
  height: 1.3rem;
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ theme }) => theme.colors.accent};
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 600px) {
    gap: 0.7rem;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  cursor: pointer;
  line-height: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: 600px) {
    font-size: 1.9rem;
    padding: 0.2rem;
  }
`;

const TimeText = styled.span`
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
`;

const Spacer = styled.div`
  flex: 1;
`;

const VolumeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  input[type="range"] {
    width: 8rem;
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: 600px) {
    input[type="range"] {
      display: none;
    }
  }
`;

const QualitySelect = styled.select`
  background: rgba(0, 0, 0, 0.5);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1.3rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
`;

const TopOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.6rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.25s ease;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  min-width: 0;
`;

const BackButton = styled.button`
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: white;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: ${({ theme }) => theme.radii.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }

  @media (max-width: 600px) {
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
  }
`;

const TitleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;

  h1 {
    font-size: 1.8rem;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.75);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 1.5rem;
    }
    span {
      font-size: 1.1rem;
    }
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const BufferingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5rem;
  height: 5rem;
  margin-top: -2.5rem;
  margin-left: -2.5rem;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: 0.4rem solid rgba(255, 255, 255, 0.25);
  border-top-color: ${({ theme }) => theme.colors.accent};
  animation: ${spin} 0.8s linear infinite;
  pointer-events: none;
`;

const CenterButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6.4rem;
  height: 6.4rem;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: none;
  background: rgba(0, 0, 0, 0.45);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }

  @media (max-width: 600px) {
    width: 5rem;
    height: 5rem;
    font-size: 2.2rem;
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  padding: 2rem;

  svg {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.textOnLight};
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.3rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.sm};

  &::before {
    content: "";
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: white;
  }
`;

function HlsPlayer(
  {
    src,
    poster,
    title,
    subtitle,
    topBarAction,
    autoPlay = true,
    fullscreen = true,
    initialTime,
    onComplete,
    onPlay,
    onReady,
    onTimeUpdate,
  },
  ref
) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const lastReportRef = useRef(0);
  const hideTimerRef = useRef(null);

  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [pipSupported, setPipSupported] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isLive = duration > 0 && !isFinite(duration);

  useImperativeHandle(ref, () => videoRef.current);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, HIDE_DELAY);
  }, []);

  const handleActivity = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    setPipSupported(document.pictureInPictureEnabled);
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreenActive(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function handlePlay() {
      setIsPlaying(true);
      scheduleHide();
      onPlay?.();
    }
    function handlePause() {
      setIsPlaying(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setShowControls(true);
    }
    function handleTimeUpdate() {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      if (!onTimeUpdate) return;
      const now = Date.now();
      if (now - lastReportRef.current < 5000) return;
      lastReportRef.current = now;
      onTimeUpdate(video.currentTime, video.duration);
    }
    function handleDurationChange() {
      setDuration(video.duration);
    }
    function handleVolumeChange() {
      setVolume(video.volume);
      setMuted(video.muted);
    }
    function handleWaiting() {
      setIsBuffering(true);
    }
    function handlePlaying() {
      setIsBuffering(false);
    }
    function handleVideoError() {
      setIsBuffering(false);
      setPlaybackError("Playback failed.");
    }

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("error", handleVideoError);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("error", handleVideoError);
    };
  }, [onPlay, onTimeUpdate, scheduleHide]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setPlaybackError(null);

    function handleReady() {
      if (initialTime) video.currentTime = initialTime;
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
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        setIsBuffering(false);
        setPlaybackError("Playback failed.");
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
  }, [src, reloadKey]);

  function handleRetry() {
    setPlaybackError(null);
    setReloadKey((key) => key + 1);
  }

  function handleLevelChange(e) {
    const value = Number(e.target.value);
    if (hlsRef.current) hlsRef.current.currentLevel = value;
    setCurrentLevel(value);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  function handleScrub(e) {
    const video = videoRef.current;
    if (!video || isLive || !isFinite(duration)) return;
    const track = e.currentTarget;
    function seekFromEvent(clientX) {
      const rect = track.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      video.currentTime = pct * duration;
    }
    seekFromEvent(e.clientX);
    function handleMove(moveEvent) {
      seekFromEvent(moveEvent.clientX);
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }

  function handleVolumeInput(e) {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.volume = value;
    video.muted = value === 0;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  }

  function handleBack() {
    navigate(-1);
  }

  function togglePiP() {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else {
      video.requestPictureInPicture().catch(() => {});
    }
  }

  const bufferedPct = isLive || !duration ? 0 : (buffered / duration) * 100;
  const progressPct = isLive || !duration ? 0 : (currentTime / duration) * 100;
  const VolumeIcon =
    muted || volume === 0
      ? PiSpeakerNoneFill
      : volume < 0.5
      ? PiSpeakerLowFill
      : PiSpeakerHighFill;

  return (
    <PlayerContainer
      ref={containerRef}
      $fullscreen={fullscreen}
      $showControls={showControls}
      onMouseMove={handleActivity}
      onTouchStart={handleActivity}
    >
      <Video
        ref={videoRef}
        playsInline
        poster={poster}
        onEnded={onComplete}
        onClick={togglePlay}
        x-webkit-airplay="allow"
      />
      {!playbackError && !isPlaying && (
        <CenterButton onClick={togglePlay} aria-label="Play">
          <PiPlayFill />
        </CenterButton>
      )}
      {!playbackError && isBuffering && isPlaying && <BufferingSpinner />}
      {playbackError && (
        <ErrorOverlay>
          <PiWarningCircleFill />
          <p>{playbackError}</p>
          <RetryButton onClick={handleRetry}>
            <PiArrowClockwise />
            Retry
          </RetryButton>
        </ErrorOverlay>
      )}
      <TopOverlay $visible={showControls}>
        <TitleGroup>
          <BackButton onClick={handleBack} aria-label="Back">
            <PiArrowLeft />
          </BackButton>
          {(title || subtitle) && (
            <TitleText>
              {title && <h1>{title}</h1>}
              {subtitle && <span>{subtitle}</span>}
            </TitleText>
          )}
        </TitleGroup>
        {topBarAction}
      </TopOverlay>
      <ControlsOverlay $visible={showControls} onClick={togglePlay}>
        <Bar onClick={(e) => e.stopPropagation()}>
          {!isLive && (
            <ScrubTrack onPointerDown={handleScrub}>
              <ScrubFill $variant="buffered" $pct={bufferedPct} />
              <ScrubFill $variant="progress" $pct={progressPct} />
              <ScrubThumb $pct={progressPct} />
            </ScrubTrack>
          )}
          <ButtonsRow>
            <IconButton onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <PiPauseFill /> : <PiPlayFill />}
            </IconButton>
            <VolumeGroup>
              <IconButton onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                <VolumeIcon />
              </IconButton>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeInput}
                aria-label="Volume"
              />
            </VolumeGroup>
            {isLive ? (
              <LiveBadge>Live</LiveBadge>
            ) : (
              <TimeText>
                {formatTime(currentTime)} / {formatTime(duration)}
              </TimeText>
            )}
            <Spacer />
            {levels.length > 1 && (
              <QualitySelect value={currentLevel} onChange={handleLevelChange}>
                <option value={-1}>Auto</option>
                {levels.map((level, i) => (
                  <option key={i} value={i}>
                    {level.height}p
                  </option>
                ))}
              </QualitySelect>
            )}
            {pipSupported && (
              <IconButton onClick={togglePiP} aria-label="Picture in picture">
                <PiPictureInPictureFill />
              </IconButton>
            )}
            <IconButton
              onClick={toggleFullscreen}
              aria-label={isFullscreenActive ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreenActive ? <PiArrowsInSimple /> : <PiArrowsOutSimple />}
            </IconButton>
          </ButtonsRow>
        </Bar>
      </ControlsOverlay>
    </PlayerContainer>
  );
}

export default forwardRef(HlsPlayer);
