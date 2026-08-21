import { useLayoutEffect, useRef, useState } from "react";
import { Grid } from "react-window";
import styled from "styled-components";
import MiniLoader from "./MiniLoader";

const Wrapper = styled.div`
  width: 100%;
  max-width: 1800px;
  margin: 2.4rem auto;
  padding: 0 var(--page-px);

  @media (max-width: 768px) {
    margin-bottom: 10.4rem;
  }
`;

const MOBILE_BREAKPOINT = 600;
const DESKTOP = { minColWidth: 250, rowHeight: 300, gap: 16 };
const MOBILE = { minColWidth: 130, rowHeight: 220, gap: 10 };

function useContainerWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

function GridCell({
  columnIndex,
  rowIndex,
  style,
  items,
  columnCount,
  gap,
  renderItem,
  isFetchingNextPage,
}) {
  const index = rowIndex * columnCount + columnIndex;
  const item = items[index];
  const cellStyle = {
    ...style,
    left: style.left + gap / 2,
    top: style.top + gap / 2,
    width: style.width - gap,
    height: style.height - gap,
  };
  if (!item) {
    return index === items.length && isFetchingNextPage ? (
      <div style={cellStyle}>
        <MiniLoader />
      </div>
    ) : null;
  }
  return <div style={cellStyle}>{renderItem(item)}</div>;
}

// ponytail: fixed viewport height rather than growing with the page —
// keeps react-window's own scroll container; revisit if design wants full-page scroll back.
function VirtualizedGrid({
  items,
  renderItem,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  height = 720,
}) {
  const [containerRef, width] = useContainerWidth();
  const isMobile = width > 0 && width <= MOBILE_BREAKPOINT;
  const { minColWidth, rowHeight, gap } = isMobile ? MOBILE : DESKTOP;

  const columnCount = width
    ? Math.max(1, Math.floor((width + gap) / (minColWidth + gap)))
    : 1;
  const columnWidth = width
    ? (width - gap * (columnCount - 1)) / columnCount
    : minColWidth;
  const rowCount =
    Math.ceil(items.length / columnCount) + (hasNextPage ? 1 : 0);

  function handleCellsRendered({ rowStopIndex }) {
    if (hasNextPage && !isFetchingNextPage && rowStopIndex >= rowCount - 2) {
      fetchNextPage();
    }
  }

  return (
    <Wrapper ref={containerRef}>
      {width > 0 && (
        <Grid
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={rowHeight}
          height={height}
          width={width}
          cellComponent={GridCell}
          cellProps={{
            items,
            columnCount,
            gap,
            renderItem,
            isFetchingNextPage,
          }}
          onCellsRendered={handleCellsRendered}
          overscanCount={2}
        />
      )}
    </Wrapper>
  );
}

export default VirtualizedGrid;
