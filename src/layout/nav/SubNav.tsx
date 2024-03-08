import { NavLink } from "react-router-dom";

type Props = {
  subNav: { title: string; path: string }[];
};

const SubNav: React.FC<Props> = ({ subNav }) => {
  return (
    <nav className="nav nav-sub">
      {/* <p className="lowercase text-neutral-500">Variants : </p> */}
      {subNav.map(({ title, path }, i) => (
        <NavLink
          key={i}
          to={path}
          className="link"
          style={({ isActive }) => {
            return {
              color: isActive ? "#ef4444" : "#64748b",
            };
          }}
        >
          {title}
        </NavLink>
      ))}
    </nav>
  );
};

export default SubNav;
