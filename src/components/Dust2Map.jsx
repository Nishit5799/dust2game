import React from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Dust2Map(props) {
  const { nodes, materials } = useGLTF("/dust2Map.glb");
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders={"trimesh"}>
        <group
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          position={[-13, -2.76, -10]}
          scale={1.719}
        >
          <group rotation={[Math.PI / 2, 0, 0]} scale={0.025}>
            <mesh
              geometry={nodes.part11_part11_0.geometry}
              material={materials.part11}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part1_part1_0.geometry}
              material={materials.part1}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part2_part2_0.geometry}
              material={materials.part2}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part3_part3_0.geometry}
              material={materials.part3}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part4_part4_0.geometry}
              material={materials.part4}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part5_part5_0.geometry}
              material={materials.part5}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part6_part6_0.geometry}
              material={materials.part6}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part7_part7_0.geometry}
              material={materials.part7}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part8_part8_0.geometry}
              material={materials.part8}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part9_part9_0.geometry}
              material={materials.part9}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
            <mesh
              geometry={nodes.part10_part10_0.geometry}
              material={materials.part10}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={0.394}
            />
          </group>
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload("/dust2Map.glb");
