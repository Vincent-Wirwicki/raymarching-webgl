import { lazy, Suspense } from "react";

import { Canvas } from "@react-three/fiber";
const DefaultShaderMesh = lazy(() => import("./BasicDisplaceRayShaderMesh"));

const BasicDisplaceRayScene = () => {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <DefaultShaderMesh />
      </Suspense>
    </Canvas>
  );
};

export default BasicDisplaceRayScene;
