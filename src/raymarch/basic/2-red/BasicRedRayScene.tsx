import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DefaultShaderMesh from "./BasicRedRayShaderMesh";

const BasicRedRayScene = () => {
  return (
    <Canvas>
      <DefaultShaderMesh />
      <OrbitControls />
    </Canvas>
  );
};

export default BasicRedRayScene;
