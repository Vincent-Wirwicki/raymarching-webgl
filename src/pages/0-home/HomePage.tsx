import HomeRayScene from "../../raymarch/0-home/HomeRayScene";

const HomePage = () => {
  return (
    <div>
      <main className="fixed top-0 left-0 z-20 w-screen h-screen flex justify-center items-center text-neutral-800">
        A project about exploring <br />
        and learning raymarching
      </main>
      <div className="fixed top-0 left-0 w-screen h-screen">
        <HomeRayScene />
      </div>
      ;
    </div>
  );
};

export default HomePage;
