import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import InfiniteBasicRayMesh from "./InfiniteTunnelsRayMesh";

const InfiniteTunnelsRayScene = () => {
  return (
    <Canvas>
      <InfiniteBasicRayMesh />
      <OrbitControls />
    </Canvas>
  );
};

export default InfiniteTunnelsRayScene;
