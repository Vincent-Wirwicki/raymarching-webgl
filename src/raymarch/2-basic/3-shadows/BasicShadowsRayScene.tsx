import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DefaultShaderMesh from "./BasicShadowsRayMesh";

const BasicShadowsRayScene = () => {
  return (
    <Canvas>
      <DefaultShaderMesh />
      <OrbitControls />
    </Canvas>
  );
};

export default BasicShadowsRayScene;
