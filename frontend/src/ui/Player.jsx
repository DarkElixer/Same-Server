// import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { hlsConfig } from "../constants/servicesConstants";
import HLSJSPlayer from "../features/player/HLSJSPlayer";
import PlyrProvider from "../features/Plyr/PLyr";
import styled from "styled-components";
// import { useEffect } from "react";
// import { getLiveStream } from "../features/iptv/playerSlice";
import Loader from "./Loader";
import Error from "./Error";

const src = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const StyledPlayer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 5dvw;
  margin-bottom: 5dvh;
  border: 1px solid white;
`;

function Player() {
  const { status, channelLink } = useSelector((state) => state.player);
  if (status === "loading") return <Loader />;
  if (status === "error") return <Error />;
  return (
    <StyledPlayer>
      <PlyrProvider>
        <HLSJSPlayer
          className="video_player"
          autoplay={true}
          hlsconfig={hlsConfig}
          src={src}
        />
      </PlyrProvider>
    </StyledPlayer>
  );
}

export default Player;
