import React, { useEffect, useRef } from "react";
import shaka from "shaka-player";

/**
 * A robust Shaka Player wrapper for React.
 */
const ShakaPlayer = ({
  src,
  poster,
  onComplete,
  onPlay,
  onReady,
  onTimeUpdate,
  playerId = "shaka-player-video",
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Store callbacks in a ref to avoid triggering useEffect on every render
  const callbacks = useRef({ onComplete, onPlay, onReady, onTimeUpdate });
  useEffect(() => {
    callbacks.current = { onComplete, onPlay, onReady, onTimeUpdate };
  }, [onComplete, onPlay, onReady, onTimeUpdate]);

  useEffect(() => {
    let playerInstance = null;

    const setupPlayer = async () => {
      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) {
        console.error("Shaka Player: Browser not supported!");
        return;
      }

      if (!playerRef.current) {
        playerInstance = new shaka.Player();
        playerRef.current = playerInstance;

        playerInstance.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 15,
            bufferBehind: 30,
          },
          manifest: {
            hls: {
              ignoreTextStreamFailures: true,
            }
          }
        });

        playerInstance.addEventListener("error", (event) => {
          console.error("Shaka Player Error:", event.detail.code, event.detail);
        });

        if (callbacks.current.onReady) {
          callbacks.current.onReady(playerInstance);
        }
      }

      const player = playerRef.current;

      if (videoRef.current && player.getMediaElement() !== videoRef.current) {
        await player.attach(videoRef.current);
      }

      if (src && !src.includes("undefined")) {
        console.log("Shaka Player: Loading source...", src);
        try {
          const mimeType = src.includes("proxy") ? "application/x-mpegurl" : null;
          await player.load(src, null, mimeType);
          console.log("Shaka Player: Source loaded successfully!");
        } catch (error) {
          if (error.code !== shaka.util.Error.Code.LOAD_INTERRUPTED) {
            console.error("Shaka Player: Load error", error.code, error);
          }
        }
      }
    };

    setupPlayer();

    // Event listeners for the video element use the current callback ref
    const onEndedWrapper = () => {
      if (callbacks.current.onComplete) callbacks.current.onComplete();
    };
    const onPlayingWrapper = () => {
      if (callbacks.current.onPlay) callbacks.current.onPlay();
    };
    const onTimeUpdateWrapper = () => {
      if (callbacks.current.onTimeUpdate && videoRef.current) {
        callbacks.current.onTimeUpdate({
          currentTime: videoRef.current.currentTime,
          duration: videoRef.current.duration,
        });
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("ended", onEndedWrapper);
      videoElement.addEventListener("play", onPlayingWrapper);
      videoElement.addEventListener("timeupdate", onTimeUpdateWrapper);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", onEndedWrapper);
        videoElement.removeEventListener("play", onPlayingWrapper);
        videoElement.removeEventListener("timeupdate", onTimeUpdateWrapper);
      }
    };
  }, [src]); // ONLY depend on src to avoid restarts on UI state changes

  // Global destruction on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      className="shaka-player-container" 
      id={playerId}
      style={{ width: "100%", height: "100%", backgroundColor: "#000", position: "relative" }}
    >
      <video
        ref={videoRef}
        poster={poster}
        style={{ width: "100%", height: "100%", outline: "none" }}
        controls
        autoPlay
        playsInline
      />
    </div>
  );
};

export default ShakaPlayer;
