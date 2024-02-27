import BasicRayScene from "./raymarch/basic/1-pink-blue/BasicRayScene";
import BasicRedRayScene from "./raymarch/basic/2-red/BasicRedRayScene";
import MainNav from "./layout/nav/MainNav";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <>
      <MainNav />
      <main className="w-screen h-screen">
        <Routes>
          <Route index path="/" />
          <Route path="/basic" element={<BasicRayScene />} />
          <Route path="/basic-red" element={<BasicRedRayScene />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
