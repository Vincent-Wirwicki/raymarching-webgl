import { RouteObject } from "react-router-dom";

import BasicsPage from "./BasicsPage";

import BasicTransformRayScene from "../../raymarch/2-basic/1-transform/BasicTransformRayScene";
import BasicDisplaceRayScene from "../../raymarch/2-basic/2-displace/BasicDisplaceRayScene";
import BasicShadowsRayScene from "../../raymarch/2-basic/3-shadows/BasicShadowsRayScene";

const useRouteBasicPage = () => {
  const basicPageRouting: RouteObject = {
    path: "/basic",
    element: <BasicsPage />,
    children: [
      {
        path: "transform",
        element: <BasicTransformRayScene />,
      },
      {
        path: "displace",
        element: <BasicDisplaceRayScene />,
      },
      {
        path: "shadows",
        element: <BasicShadowsRayScene />,
      },
    ],
  };

  return basicPageRouting;
};

export default useRouteBasicPage;
