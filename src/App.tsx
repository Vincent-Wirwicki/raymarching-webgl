import BasicTransformRayScene from "./raymarch/basic/1-transform/BasicTransformRayScene";
import BasicDisplaceRayScene from "./raymarch/basic/2-displace/BasicDisplaceRayScene";
import BasicShadowsRayScene from "./raymarch/basic/3-shadows/BasicShadowsRayScene";
import HomePage from "./pages/home/HomePage";
import { Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import BasicsPage from "./pages/basic/BasicsPage";

const App = () => {
  return (
    <>
      <Layout />
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/basic" element={<BasicsPage />}>
          <Route path="/basic/transform" element={<BasicTransformRayScene />} />
          <Route path="/basic/displace" element={<BasicDisplaceRayScene />} />
          <Route path="/basic/shadows" element={<BasicShadowsRayScene />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
