import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import VodCategoriesItem from "./features/vod/VodCategoriesItem";
import LiveCategories from "./features/live/LiveCategories";
import VodCategories from "./features/vod/VodCategories";
import Home, { loader } from "./features/homepage/Home";
import GlobalStyles from "./styles/GlobalStyles";
import AppLayout from "./ui/AppLayout";
import LiveChannels from "./features/live/LiveChannels";
import Error from "./ui/Error";
import NotFound from "./ui/NotFound";
import SearchedItemBox from "./features/SearchBar/SearchedItemBox";
import Loader from "./ui/Loader";
import VodShakaPlayer from "./features/vod/VodShakaPlayer";
import LiveShakaPlayer from "./features/live/LiveShakaPlayer";
import SeriesSeasonsList from "./features/series/SeriesSeasonsList";
import SeriesSeasonEpisodesList from "./features/series/SeriesSeasonEpisodesList";
import SeriesShakaPlayer from "./features/series/SeriesShakaPlayer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
        hydrateFallbackElement: <Loader />,
        loader,
      },
      {
        path: "/search",
        element: <SearchedItemBox />,
        errorElement: <Error />,
      },
      {
        path: "/live/categories",
        element: <LiveCategories />,
        errorElement: <Error />,
      },
      {
        path: "/live/categories/:categoryId",
        element: <LiveChannels />,
        errorElement: <Error />,
      },
      {
        path: "/vod/categories",
        element: <VodCategories />,
        errorElement: <Error />,
      },
      {
        path: "/vod/categories/:categoryId",
        element: <VodCategoriesItem />,
        errorElement: <Error />,
      },
      {
        path: "/series/:seriesName",
        element: <SeriesSeasonsList />,
        errorElement: <Error />,
      },
      {
        path: "/series/:seriesName/:seasonNo",
        element: <SeriesSeasonEpisodesList />,
        errorElement: <Error />,
      },
    ],
  },
  {
    path: "live/play/:channelname",
    element: <LiveShakaPlayer />,
    errorElement: <Error />,
  },
  {
    path: "/movie/play/:movieName",
    element: <VodShakaPlayer />,
  },
  {
    path: "/series/:seriesName/:seasonNo/play/:episodeNo",
    element: <SeriesShakaPlayer />,
    errorElement: <Error />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <GlobalStyles />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
