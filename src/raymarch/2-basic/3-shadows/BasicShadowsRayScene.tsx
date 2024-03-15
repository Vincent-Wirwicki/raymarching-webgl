import { lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
const DefaultShaderMesh = lazy(() => import("./BasicShadowsRayMesh"));

const BasicShadowsRayScene = () => {
  return (
    <Suspense fallback={null}>
      <Canvas>
        <DefaultShaderMesh />
      </Canvas>
    </Suspense>
  );
};

export default BasicShadowsRayScene;
