import styled from "styled-components";
import { SkeletonBlock } from "../../ui/skeletonStyles";
import VodRowSkeleton from "./VodRowSkeleton";

const HeroSkeleton = styled(SkeletonBlock)`
  height: 486px;
  border-radius: 0;

  @media (max-width: 768px) {
    height: 380px;
  }
`;

export function HomeSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <VodRowSkeleton count={8} />
      <VodRowSkeleton count={8} />
      <VodRowSkeleton count={8} />
    </>
  );
}

export default HomeSkeleton;
