import { lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
// import BasicRayMesh from "./BasicRayMesh";

const BasicRayMesh = lazy(() => import("./BasicTransformRayMesh"));

const BasicTransformRayScene = () => {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <BasicRayMesh />
      </Suspense>
    </Canvas>
  );
};

export default BasicTransformRayScene;
