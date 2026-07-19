import styled from "styled-components";
import { SkeletonBlock } from "./skeletonStyles";

const Screen = styled.div`
  width: 100%;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PulseCircle = styled(SkeletonBlock)`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.circle};
`;

function PlayerSkeleton() {
  return (
    <Screen>
      <PulseCircle />
    </Screen>
  );
}

export default PlayerSkeleton;
