import { Outlet } from "react-router-dom";
import SubNav from "../../layout/nav/SubNav";

type Props = { id: string; path: { title: string; path: string }[] };

const PageLayout: React.FC<Props> = ({id, path}) => {
  return (
    <div id={id} className="page">
      <SubNav subNav={path} />
      <section className="canvas">
        <Outlet />
      </section>
    </div>
  );
};

export default PageLayout;
