import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DefaultShaderMesh from "./BasicInfiniteRayMesh";

const BasicInfiniteRayScene = () => {
  return (
    <Canvas>
      <DefaultShaderMesh />
      <OrbitControls />
    </Canvas>
  );
};

export default BasicInfiniteRayScene;
