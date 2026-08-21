import styled from "styled-components";
import { SkeletonBlock } from "../../ui/skeletonStyles";
import { Wrapper, RowHeader, Row } from "./homeRowStyles";

const TitleSkeleton = styled(SkeletonBlock)`
  height: 2.2rem;
  width: 140px;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const CardSkeleton = styled(SkeletonBlock)`
  flex: 0 0 160px;
  height: 230px;
  border-radius: ${({ theme }) => theme.radii.md};

  @media (max-width: 600px) {
    flex-basis: 120px;
    height: 175px;
  }
`;

function VodRowSkeleton({ count = 8 }) {
  return (
    <Wrapper>
      <RowHeader>
        <TitleSkeleton />
      </RowHeader>
      <Row style={{ overflowX: "hidden" }}>
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </Row>
    </Wrapper>
  );
}

export default VodRowSkeleton;
