import styled from "styled-components";
import { SkeletonBlock } from "../../ui/skeletonStyles";
import VodRowSkeleton from "./VodRowSkeleton";

const GridBox = styled.div`
  position: relative;
  max-width: 1800px;
  margin: 2.4rem auto;
  padding: 0 var(--page-px);
  display: grid;
  gap: 2.4rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

  @media (max-width: 600px) {
    gap: 1.2rem;
  }
`;

const QuickActionSkeleton = styled(SkeletonBlock)`
  height: 140px;
  border-radius: ${({ theme }) => theme.radii.xl || "16px"};
`;

export function HomeSkeleton() {
  return (
    <>
      <VodRowSkeleton count={8} />
      <VodRowSkeleton count={8} />
      <VodRowSkeleton count={8} />
      <GridBox>
        <QuickActionSkeleton />
        <QuickActionSkeleton />
      </GridBox>
    </>
  );
}

export default HomeSkeleton;
