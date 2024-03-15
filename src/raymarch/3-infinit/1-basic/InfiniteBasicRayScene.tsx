import { Canvas } from "@react-three/fiber";
import { lazy, Suspense } from "react";

const InfiniteBasicRayMesh = lazy(() => import("./InfiniteBasicRayMesh"));

const InfiniteBasicRayScene = () => {
  return (
    <Suspense fallback={null}>
      <Canvas>
        <InfiniteBasicRayMesh />
      </Canvas>
    </Suspense>
  );
};

export default InfiniteBasicRayScene;
