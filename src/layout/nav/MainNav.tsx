import { Link, useLocation } from "react-router-dom";
import { navPaths } from "../../navPath";

const MainNav = () => {
  const location = useLocation();
  const filter = location.pathname.split("/")[1];

  return (
    <nav className="nav nav-main">
      {navPaths.map(({ title, path }, i) => (
        <Link
          key={i}
          to={path}
          className="link"
          style={{
            color:
              title === filter || (title === "home" && filter === "")
                ? "#3b82f6"
                : "#64748b",
          }}
        >
          {title}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
