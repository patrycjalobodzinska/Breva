"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Grid } from "@react-three/drei";
import { WomanModel } from "./WomanModel";
import { useRef } from "react";
import * as THREE from "three";

interface Scene3DProps {
  className?: string;
  wireframeParts?: "all" | "breast" | "torso" | "upper" | "none";
}

export const Scene3D = ({
  className = "",
  wireframeParts = "upper",
}: Scene3DProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [1, 1, 4], fov: 45 }}
        style={{ background: "transparent" }}
        onCreated={({ camera }) => {
          camera.position.set(1, 1, 4);
        }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 3]} intensity={1.5} />
        <directionalLight position={[-5, 8, 3]} intensity={1.0} />
        <directionalLight position={[0, 10, 0]} intensity={0.8} />
        <pointLight position={[0, 3, 2]} intensity={0.8} color="#ed6d6d" />

        <Environment preset="studio" />

        <WomanModel
          scale={5}
          position={[0.5, -6, 0]}
          rotation={[0, 0, 0]}
          wireframeParts={wireframeParts}
        />
      </Canvas>
    </div>
  );
};
