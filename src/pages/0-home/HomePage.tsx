import HomeRayScene from "../../raymarch/0-home/HomeRayScene";

const HomePage = () => {
  return (
    <div>
      <main className="page-home">
        A project about exploring <br />
        and learning raymarching
      </main>
      <div className="canvas">
        <HomeRayScene />
      </div>
    </div>
  );
};

export default HomePage;
