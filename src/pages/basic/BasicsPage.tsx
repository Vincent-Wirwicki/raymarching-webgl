import { Outlet } from "react-router-dom";
import SubNav from "../../layout/nav/SubNav";
import { navPathBasics } from "../../navPath";

const BasicsPage = () => {
  return (
    <div id="basics" className="page">
      <SubNav subNav={navPathBasics} />
      <section className="canvas">
        <Outlet />
      </section>
    </div>
  );
};

export default BasicsPage;
