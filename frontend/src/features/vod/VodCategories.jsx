import { getAllCategories } from "../../services/apiIptv";
import { replaceSpecialChars } from "../../util/helper";
import { useQuery } from "@tanstack/react-query";
import { GridBox } from "../../ui/GridBox";
import { Heading } from "../../ui/Heading";
import { Box } from "../../ui/Box";

import GridSkeleton from "../../ui/GridSkeleton";
import Image from "../../ui/Image";
import PageHeader from "../../ui/PageHeader";

function VodCategories() {
  const { isLoading, data } = useQuery({
    queryKey: ["vodCategories"],
    queryFn: () => getAllCategories("vod"),
    staleTime: Infinity,
  });
  if (isLoading) return <GridSkeleton />;
  console.log(data.sort((a, b) => (a.title < b.title ? -1 : 1)));
  return (
    <>
      <PageHeader>
        <div className="top">
          <Heading as="h2" $type="heading">
            Vod Categories
          </Heading>
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

export default VodCategories;
