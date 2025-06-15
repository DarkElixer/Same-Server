import { useEffect, useRef } from "react";

function useStream() {
  const playerRef = useRef(null);

  // Bandwidth estimation variables
  const segmentDownloadTimes = useRef([]);
  const currentPlaybackRate = useRef(0.9); // Start slightly slower
  useEffect(() => {
    const estimateBandwidth = () => {
      if (segmentDownloadTimes.current.length > 0) {
        const avgTime =
          segmentDownloadTimes.current.reduce((a, b) => a + b, 0) /
          segmentDownloadTimes.current.length;
        return (6 / avgTime) * 8; // Mbps
      }
      return 1; // Default estimate
    };

    const adjustPlayback = () => {
      const bw = estimateBandwidth();
      console.log(bw);
      const player = playerRef.current;

      if (bw < 1.5) {
        // Poor connection
        const newRate = Math.max(0.5, (bw / 3).toFixed(1));
        currentPlaybackRate.current = newRate;
        player.setPlaybackRate(newRate);
      }
    };

    // Mock function - implement actual segment tracking
    const trackSegmentDownload = (segmentTime) => {
      segmentDownloadTimes.current.push(segmentTime);
      console.log(segmentDownloadTimes);
      if (segmentDownloadTimes.current.length > 3) {
        segmentDownloadTimes.current.shift();
      }
      adjustPlayback();
    };

    // Simulate tracking (replace with actual implementation)
    const id = setInterval(() => {
      trackSegmentDownload(10); // Your 10s download time
    }, 6000);
    () => clearInterval(id);
  }, []);
  return {
    playerRef,
    currentPlaybackRate,
  };
}

export default useStream;
