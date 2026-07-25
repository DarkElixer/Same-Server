import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
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
import VodPlayer from "./features/vod/VodPlayer";
import LivePlayer from "./features/live/LivePlayer";
import SeriesSeasonsList from "./features/series/SeriesSeasonsList";
import SeriesSeasonEpisodesList from "./features/series/SeriesSeasonEpisodesList";
import SeriesPlayer from "./features/series/SeriesPlayer";
import MyList from "./features/mylist/MyList";

if (typeof window !== "undefined" && window.localStorage) {
  localStorage.removeItem("token");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,
      staleTime: Infinity,
      retry: 1,
      retryDelay: (attempt) =>
        Math.min(1000 * 2 ** attempt, 10000) + Math.random() * 300,
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
        path: "/my-list",
        element: <MyList />,
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
    element: <LivePlayer />,
    errorElement: <Error />,
  },
  {
    path: "/movie/play/:movieName",
    element: <VodPlayer />,
  },
  {
    path: "/series/:seriesName/:seasonNo/play/:episodeNo",
    element: <SeriesPlayer />,
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
      <ThemeProvider theme={theme}>
        <ReactQueryDevtools initialIsOpen={false} />
        <GlobalStyles />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
