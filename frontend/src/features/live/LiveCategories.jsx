import { getAllCategories } from "../../services/apiIptv";
import { replaceSpecialChars } from "../../util/helper";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Heading } from "../../ui/Heading";
import { GridBox } from "../../ui/GridBox";
import { Box } from "../../ui/Box";

import GridSkeleton from "../../ui/GridSkeleton";
import Image from "../../ui/Image";
import PageHeader from "../../ui/PageHeader";
import { eyebrow } from "../../styles/mixins";

const Eyebrow = styled.span`
  ${eyebrow}
`;

function LiveCategories() {
  const { isLoading, data } = useQuery({
    queryKey: ["liveCategories"],
    queryFn: () => getAllCategories("live"),
    staleTime: Infinity,
  });
  if (isLoading) return <GridSkeleton />;
  return (
    <>
      <PageHeader>
        <div className="top">
          <div>
            <Eyebrow>LIVE TV</Eyebrow>
            <Heading as="h2" $type="heading">
              Categories
            </Heading>
          </div>
        </div>
      </PageHeader>
      <GridBox>
        {data?.map((genre) => {
          if (genre.title === "All") return null;
          return (
            <Box
              key={genre.id}
              to={`${replaceSpecialChars(genre.title)}-${genre.id}`}
            >
              <Image
                src={
                  "https://cdn.pixabay.com/photo/2020/11/23/06/21/television-5768804_640.png"
                }
                altText={genre.title}
              />
              <p>{genre.title}</p>
            </Box>
          );
        })}
      </GridBox>
    </>
  );
}

export default LiveCategories;
