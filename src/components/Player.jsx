import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function Player({ animation, ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/player.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Reset and fade in the selected animation, default to "idle" if no animation is provided
    actions[animation]?.reset().fadeIn(0.24).play();

    return () => actions?.[animation]?.fadeOut(0.24); // Clean up on unmount or animation change
  }, [animation, actions]);

  return (
    <>
      <group
        ref={group}
        {...props}
        dispose={null}
        rotation={[0, Math.PI / 30, 0]}
      >
        <group name="Scene">
          <group name="Armature">
            <primitive object={nodes.mixamorigHips} />
            <primitive object={nodes.Ctrl_Master} />
            <primitive object={nodes.Ctrl_ArmPole_IK_Left} />
            <primitive object={nodes.Ctrl_Hand_IK_Left} />
            <primitive object={nodes.Ctrl_ArmPole_IK_Right} />
            <primitive object={nodes.Ctrl_Hand_IK_Right} />
            <primitive object={nodes.Ctrl_Foot_IK_Left} />
            <primitive object={nodes.Ctrl_LegPole_IK_Left} />
            <primitive object={nodes.Ctrl_Foot_IK_Right} />
            <primitive object={nodes.Ctrl_LegPole_IK_Right} />
            <skinnedMesh
              name="Ch14"
              geometry={nodes.Ch14.geometry}
              material={materials.Ch14_Body}
              skeleton={nodes.Ch14.skeleton}
              castShadow // Enable shadow casting
              receiveShadow // Enable shadow receiving
            />
          </group>
        </group>
      </group>
    </>
  );
}

useGLTF.preload("/player.glb");
