"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type * as THREE from "three";

// Baked .glb asset (front/back photo + procedural edge texture + handle),
// generated offline by `frontend/scripts/export-paddle-glb.mjs` — the app
// now loads a real 3D model file instead of building geometry at runtime.
const MODEL_URL = "/models/paddle.glb";

function PaddleMesh({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  useFrame(() => {
    if (!groupRef.current) return;
    // Rotation is driven purely by scroll progress (no idle auto-spin).
    // The paddle rocks side-to-side within a limited yaw range instead of
    // doing a full 0..360 spin: at exactly +-90/270 deg the camera looks
    // straight at the thin edge (much narrower than the face), so a full
    // spin makes the paddle "disappear" into a sliver for part of the
    // scroll. Clamping the yaw swing keeps the face/edge both visible at
    // all times while still reacting continuously to scroll.
    const yaw = Math.sin(progress * Math.PI * 2) * (Math.PI * 0.38); // ~ +-68deg
    groupRef.current.rotation.y = yaw;
    groupRef.current.rotation.x = 0.15 + Math.sin(progress * Math.PI * 2) * 0.18;
    groupRef.current.rotation.z = Math.sin(progress * Math.PI * 2) * 0.08;
  });

  return (
    <group ref={groupRef} scale={0.6}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

export default function Paddle3DModel({ progress }: { progress: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <Canvas
        shadows
        camera={{ position: [0, 0, 7.2], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={0.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, -2, -3]} intensity={0.2} color="#ffffff" />
        <Suspense fallback={null}>
          <PaddleMesh progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
