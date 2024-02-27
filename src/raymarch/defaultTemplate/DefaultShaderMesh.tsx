import { useMemo, useRef } from "react";
import { ShaderMaterial, Vector2 } from "three";
import { useFrame } from "@react-three/fiber";

import { defaultVertex } from "./shader/defaultVertex";
import { defaultFragment } from "./shader/defaultFragment";
import { useAspect } from "@react-three/drei";

const DefaultShaderMesh = () => {
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
      vertex: defaultVertex,
      fragment: defaultFragment,
    }),
    []
  );

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
      // shaderRef.current.uniforms.uResolution.value.x = window.innerWidth;
      // shaderRef.current.uniforms.uResolution.value.y = window.innerHeight;
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

export default DefaultShaderMesh;
