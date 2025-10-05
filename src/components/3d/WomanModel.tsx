"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Edges } from "@react-three/drei";
import { Mesh, Material } from "three";

interface WomanModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  wireframeParts?: "all" | "breast" | "torso" | "upper" | "none";
}

export const WomanModel = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  wireframeParts = "breast",
}: WomanModelProps) => {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useGLTF("/FemaleBaseMesh.glb");

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const angle = Math.sin(time * 0.3) * (Math.PI / 6);
      meshRef.current.rotation.y = angle;

      meshRef.current.traverse((child) => {
        if (
          child instanceof Mesh &&
          child.material &&
          child.material.wireframe
        ) {
          const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
          child.material.opacity = pulse;
        }
      });
    }
  });

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          const solidMaterial = child.material.clone();
          solidMaterial.wireframe = false;
          solidMaterial.transparent = false;
          solidMaterial.opacity = 1;
          solidMaterial.color.set("#f0f0f0");

          child.material = solidMaterial;
        }
      });
    }
  }, [scene]);

  return (
    <group ref={meshRef}>
      <primitive
        object={scene}
        scale={scale}
        position={position}
        rotation={rotation}
      />
      <Edges
        geometry={(scene.children[0] as Mesh)?.geometry}
        scale={scale}
        position={position}
        rotation={rotation}
        color="#f18e8e"
        lineWidth={1.5}
        threshold={0.01}
      />
    </group>
  );
};

useGLTF.preload("/FemaleBaseMesh.glb");
