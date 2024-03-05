import { RouteObject } from "react-router-dom";

import InfinitPage from "./InfinitPage";

import InfiniteBasicRayScene from "../../raymarch/3-infinit/1-basic/InfiniteBasicRayScene";

const useRouteInfinitPage = () => {
  const infinitPageRouting: RouteObject = {
    path: "/infinite",
    element: <InfinitPage />,
    children: [
      {
        path: "basic",
        element: <InfiniteBasicRayScene />,
      },
    ],
  };

  return infinitPageRouting;
};

export default useRouteInfinitPage;
