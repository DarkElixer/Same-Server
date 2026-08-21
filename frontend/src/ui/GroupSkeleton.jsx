import styled from "styled-components";
import { SkeletonBlock } from "./skeletonStyles";

const StyledGroupSkeleton = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.5rem 0;
  overflow: hidden;
`;

const SkeletonItem = styled(SkeletonBlock)`
  width: 90px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.pill};
  display: inline-block;
  flex: 0 0 auto;
`;

function GroupSkeleton() {
  return (
    <StyledGroupSkeleton>
      {Array.from({ length: 14 }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </StyledGroupSkeleton>
  );
}

export default GroupSkeleton;
