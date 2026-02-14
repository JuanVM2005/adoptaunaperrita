// src/components/DogHead3D.tsx
"use client";

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

function Model() {
  const gltf = useGLTF("/model/untitled.glb");

  const ref = useRef<THREE.Object3D>(null);
  const targetRot = useRef(new THREE.Euler(0, 0, 0));

  useFrame((state) => {
    if (!ref.current) return;

    const x = state.pointer.x;
    const y = state.pointer.y;

    const maxYaw = 0.25;
    const maxPitch = 0.15;

    targetRot.current.y = x * maxYaw;
    targetRot.current.x = -y * maxPitch;

    const smooth = 0.08;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      targetRot.current.x,
      smooth
    );
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      targetRot.current.y,
      smooth
    );
  });

  return (
    <primitive
      ref={ref}
      object={gltf.scene}
      scale={1.25}
      position={[-0.05, -0.62, -0.5]}
    />
  );
}

export default function DogHead3D() {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0.2, 2.2], fov: 40 }}
      // ✅ bajar costo del render
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      // ✅ evita dpr altísimo en pantallas retina
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 2, 2]} intensity={1.2} />
      <directionalLight position={[-2, 1, 1]} intensity={0.6} />

      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}

// ❌ Quitar preload global para que NO bloquee la carga inicial
// useGLTF.preload("/model/untitled.glb");
