import Layout from "./layout/Layout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/0-home/HomePage";

import useRouteBasicPage from "./pages/1-basic/useRoutingBasicPage";
import useRouteInfinitPage from "./pages/2-infinit/useRouteInfinitPage";

const App = () => {
  const basicPageRouting = useRouteBasicPage();
  const infinitPageRouting = useRouteInfinitPage();

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        { path: "/", element: <HomePage /> },
        { ...basicPageRouting },
        { ...infinitPageRouting },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
