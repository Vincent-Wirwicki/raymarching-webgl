import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import InfiniteBasicRayMesh from "./InfiniteBasicRayMesh";

const InfiniteBasicRayScene = () => {
  return (
    <Canvas>
      <InfiniteBasicRayMesh />
      <OrbitControls />
    </Canvas>
  );
};

export default InfiniteBasicRayScene;
