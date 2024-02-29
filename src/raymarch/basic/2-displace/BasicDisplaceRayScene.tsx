import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DefaultShaderMesh from "./BasicDisplaceRayShaderMesh";

const BasicDisplaceRayScene = () => {
  return (
    <Canvas>
      <DefaultShaderMesh />
      <OrbitControls />
    </Canvas>
  );
};

export default BasicDisplaceRayScene;
