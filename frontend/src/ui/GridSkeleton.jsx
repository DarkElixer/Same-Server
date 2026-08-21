import styled from "styled-components";
import { GridBox } from "./GridBox";
import { SkeletonBlock } from "./skeletonStyles";

const SkeletonTile = styled(SkeletonBlock)`
  margin: 2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  height: calc(100% - 4rem);
`;

function GridSkeleton({ count = 14 }) {
  return (
    <GridBox>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTile key={i} />
      ))}
    </GridBox>
  );
}

export default GridSkeleton;
