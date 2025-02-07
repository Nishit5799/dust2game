import React, { useEffect, useRef, useState } from "react";
import Player from "./Player";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useKeyboardControls } from "@react-three/drei";
import { degToRad, MathUtils } from "three/src/math/MathUtils";

const PlayerController = () => {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
    "Character Control",
    {
      WALK_SPEED: { value: 0.8, min: 0.1, max: 4, step: 0.1 },
      RUN_SPEED: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
      ROTATION_SPEED: {
        value: degToRad(0.5),
        min: degToRad(0.1),
        max: degToRad(5),
        step: degToRad(0.1),
      },
    }
  );

  const inTheAir = useRef(false);
  const rb = useRef();
  const container = useRef();
  const cameraTarget = useRef();
  const cameraPosition = useRef();
  const character = useRef();
  const rotationTarget = useRef(0);
  const characterRotationTarget = useRef(0);
  const [animation, setAnimation] = useState("idle");
  const [, get] = useKeyboardControls();

  const JUMP_FORCE = 3;

  // Mouse Drag Variables (only for small screens)
  const dragStart = useRef(new Vector3());
  const dragEnd = useRef(new Vector3());
  const dragging = useRef(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 640); // sm breakpoint (640px)

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (event) => {
    if (!isSmallScreen) return;
    dragStart.current.set(event.clientX, event.clientY, 0);
    dragging.current = true;
  };

  const handlePointerMove = (event) => {
    if (!isSmallScreen || !dragging.current) return;
    dragEnd.current.set(event.clientX, event.clientY, 0);
  };

  const handlePointerUp = () => {
    if (!isSmallScreen || !dragging.current) return;

    const deltaX = dragEnd.current.x - dragStart.current.x;
    const deltaY = dragEnd.current.y - dragStart.current.y;

    let movement = { x: 0, z: 0 };
    let speed = RUN_SPEED;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) movement.x = 1; // Swipe Right
      else movement.x = -1; // Swipe Left
    } else {
      if (deltaY > 0) movement.z = -1; // Swipe Down (Backward)
      else movement.z = 1; // Swipe Up (Forward)
    }

    if (rb.current) {
      let vel = rb.current.linvel();
      vel.x =
        Math.sin(rotationTarget.current + characterRotationTarget.current) *
        speed *
        movement.z;
      vel.z =
        Math.cos(rotationTarget.current + characterRotationTarget.current) *
        speed *
        movement.z;

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * movement.x;
      }

      rb.current.setLinvel(vel, true);
      setAnimation(movement.z !== 0 ? "run" : "idle");
    }

    dragging.current = false;
  };

  useFrame(() => {
    if (!rb.current) return;
    const vel = rb.current.linvel();
    const curVel = rb.current.linvel();

    // Keyboard Movement Handling
    const movement = { x: 0, z: 0 };
    let speed = get().run ? RUN_SPEED : WALK_SPEED;

    if (get().forward) movement.z = 1;
    if (get().backward) movement.z = -1;
    if (get().left) movement.x = 1;
    if (get().right) movement.x = -1;
    if (get().jump && !inTheAir.current) {
      vel.y += JUMP_FORCE;
      inTheAir.current = true;
    } else {
      vel.y = curVel.y;
    }

    if (movement.x !== 0) {
      rotationTarget.current += ROTATION_SPEED * movement.x;
    }

    if (movement.x !== 0 || movement.z !== 0) {
      characterRotationTarget.current = Math.atan2(movement.x, movement.z);
      vel.x =
        Math.sin(rotationTarget.current + characterRotationTarget.current) *
        speed;
      vel.z =
        Math.cos(rotationTarget.current + characterRotationTarget.current) *
        speed;
      setAnimation(speed === RUN_SPEED ? "run" : "walk");
    } else {
      setAnimation("idle");
    }

    character.current.rotation.y = MathUtils.lerp(
      character.current.rotation.y,
      characterRotationTarget.current,
      0.1
    );
    rb.current.setLinvel(vel, true);
  });

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <RigidBody
        colliders={false}
        lockRotations
        ref={rb}
        onCollisionEnter={({ other }) => {
          if (other.rigidBodyObject.name === "ground") {
            inTheAir.current = false;
          }
        }}
      >
        <group ref={container}>
          <group ref={cameraTarget} position-z={1.5} />
          <group ref={cameraPosition} position-y={1.5} position-z={-1.5} />
          <group ref={character}>
            <Player position-y={-0.58} animation={animation} />
          </group>
        </group>
        <CapsuleCollider args={[0.3, 0.6]} position-y={-0.52} />
      </RigidBody>
    </group>
  );
};

export default PlayerController;
