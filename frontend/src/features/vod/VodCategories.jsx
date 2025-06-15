import { getAllCategories } from "../../services/apiIptv";
import { replaceSpecialChars } from "../../util/helper";
import { useQuery } from "@tanstack/react-query";
import { GridBox } from "../../ui/GridBox";
import { Heading } from "../../ui/Heading";
import { Box } from "../../ui/Box";

import Loader from "../../ui/Loader";
import Image from "../../ui/Image";

function VodCategories() {
  const { isLoading, data } = useQuery({
    queryKey: ["vodCategories"],
    queryFn: () => getAllCategories("vod"),
    retry: false,
    staleTime: Infinity,
  });
  if (isLoading) return <Loader />;
  console.log(data.sort((a, b) => (a.title < b.title ? -1 : 1)));
  return (
    <>
      <div className="header">
        <Heading as="h2" $type="secondary">
          Vod Categories
        </Heading>
      </div>
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
