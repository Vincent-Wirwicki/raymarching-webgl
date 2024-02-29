import { lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";

const BasicRayMesh = lazy(() => import("./HomeRaymarchMesh"));

const HomeRayScene = () => {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <BasicRayMesh />
      </Suspense>
    </Canvas>
  );
};

export default HomeRayScene;
