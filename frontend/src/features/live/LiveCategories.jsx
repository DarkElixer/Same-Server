import { getAllCategories } from "../../services/apiIptv";
import { replaceSpecialChars } from "../../util/helper";
import { useQuery } from "@tanstack/react-query";
import { Heading } from "../../ui/Heading";
import { GridBox } from "../../ui/GridBox";
import { Box } from "../../ui/Box";

import Loader from "../../ui/Loader";
import Image from "../../ui/Image";

function LiveCategories() {
  const { isLoading, data } = useQuery({
    queryKey: ["liveCategories"],
    queryFn: () => getAllCategories("live"),
    retry: false,
    staleTime: Infinity,
  });
  if (isLoading) return <Loader />;
  return (
    <>
      <div className="header">
        <Heading as="h2" $type="secondary">
          Live Categories
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

export default LiveCategories;
