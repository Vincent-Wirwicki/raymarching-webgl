import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DefaultShaderMesh from "./DefaultShaderMesh";

const DefaultShaderScene = () => {
  return (
    <Canvas>
      <DefaultShaderMesh />
      <OrbitControls />
    </Canvas>
  );
};

export default DefaultShaderScene;
