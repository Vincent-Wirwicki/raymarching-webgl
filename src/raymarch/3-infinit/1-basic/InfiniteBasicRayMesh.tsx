import { useMemo, useRef } from "react";
import { ShaderMaterial, Vector2 } from "three";
import { useFrame } from "@react-three/fiber";

import { vertex } from "../../1-utis/vertex";
import { infinitFragment } from "./shader/infinitFragment";
import { useAspect } from "@react-three/drei";

const InfiniteBasicRayMesh = () => {
  const scale = useAspect(window.innerWidth, window.innerHeight, 1);
  const shaderRef = useRef<ShaderMaterial | null>(null);

  const dataShader = useMemo(
    () => ({
      uniforms: {
        uTime: { type: "f", value: 0 },
        uResolution: {
          type: "v2",
          value: new Vector2(),
        },
      },
      vertex: vertex,
      fragment: infinitFragment,
    }),
    []
  );

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
      shaderRef.current.uniforms.uResolution.value = new Vector2(
        window.innerWidth,
        window.innerHeight
      );
    }
  });

  return (
    <mesh scale={[...scale]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={shaderRef}
        uniforms={dataShader.uniforms}
        fragmentShader={dataShader.fragment}
        vertexShader={dataShader.vertex}
        //  transparent={true}
      />
    </mesh>
  );
};

export default InfiniteBasicRayMesh;
