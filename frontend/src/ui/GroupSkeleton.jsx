import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
`;

const StyledGroupSkeleton = styled.div`
  display: flex;
  gap: 1rem;
  margin: 0 2rem;
  padding: 0.5rem 1rem;
  overflow: hidden;
`;

const SkeletonItem = styled.div`
  width: 90px;
  height: 32px;
  border-radius: 1rem;
  background: #2a2a2a;
  background-image: linear-gradient(
    to right,
    #2a2a2a 0%,
    #3a3a3a 20%,
    #2a2a2a 40%,
    #2a2a2a 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 40px;
  display: inline-block;
  animation: ${shimmer} 2s infinite linear;
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
