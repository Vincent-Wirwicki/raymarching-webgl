import { RouteObject } from "react-router-dom";

import InfinitPage from "./InfinitPage";

import InfiniteBasicRayScene from "../../raymarch/3-infinit/1-basic/InfiniteBasicRayScene";
import InfiniteTunnelsRayScene from "../../raymarch/3-infinit/2-tunnels/InfiniteTunnelsRayScene";

const useRouteInfinitPage = () => {
  const infinitPageRouting: RouteObject = {
    path: "/infinite",
    element: <InfinitPage />,
    children: [
      {
        path: "basic",
        element: <InfiniteBasicRayScene />,
      },
      {
        path: "tunnels",
        element: <InfiniteTunnelsRayScene />,
      },
    ],
  };

  return infinitPageRouting;
};

export default useRouteInfinitPage;
