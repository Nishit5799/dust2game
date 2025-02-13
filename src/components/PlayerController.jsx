import React, { useEffect, useRef, useState } from "react";
import Player from "./Player";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { useKeyboardControls } from "@react-three/drei";
import { MathUtils } from "three/src/math/MathUtils";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

const PlayerController = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const { scene } = useThree();
  const spotLightRef = useRef();
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.type === "SpotLight") {
          spotLightRef.current = child;
        }
      });
    }
  }, [scene]);

  // const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
  //   "Character Control",
  //   {
  //     WALK_SPEED: { value: 0.8, min: 0.1, max: 4, step: 0.1 },
  //     RUN_SPEED: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
  //     ROTATION_SPEED: {
  //       value: degToRad(0.5),
  //       min: degToRad(0.1),
  //       max: degToRad(5),
  //       step: degToRad(0.1),
  //     },
  //   }
  // );
  const WALK_SPEED = isSmallScreen ? 2.5 : 2.5;
  const RUN_SPEED = isSmallScreen ? 3.7 : 4;
  const ROTATION_SPEED = isSmallScreen ? 0.045 : 0.04;
  const inTheAir = useRef(false);
  const rb = useRef();
  const container = useRef();
  const cameraTarget = useRef();
  const [animation, setAnimation] = useState("idle");
  const cameraPosition = useRef();
  const character = useRef();
  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(0);
  const cameraWorldPosition = useRef(new Vector3());
  const cameraLookAtWorldPosition = useRef(new Vector3());
  const cameraLookAt = useRef(new Vector3());
  const [, get] = useKeyboardControls();
  const isClicking = useRef(false);
  const lastTap = useRef(0);
  const movement = useRef({ x: 0, z: 0 });
  const isMoving = useRef(false);

  const JUMP_FORCE = isSmallScreen ? 3.8 : 3.3;

  useEffect(() => {
    const onMouseDown = (e) => {
      isClicking.current = true;
    };

    const onMouseUp = (e) => {
      isClicking.current = false;
    };

    const onTouchStart = (e) => {
      isClicking.current = true;
      e.preventDefault(); // Prevents long-press selection
    };

    const onTouchEnd = (e) => {
      isClicking.current = false;
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        movement.current.x = (touch.clientX / window.innerWidth - 0.5) * 2;
        movement.current.z = (touch.clientY / window.innerHeight - 0.5) * -2;
        isMoving.current = true;
      }
    };

    const onTouchEnd = (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap.current;
      if (
        tapLength < 300 &&
        !inTheAir.current &&
        e.changedTouches.length === 1
      ) {
        if (rb.current) {
          const vel = rb.current.linvel();
          vel.y += JUMP_FORCE;
          rb.current.setLinvel(vel, true);
          inTheAir.current = true;
        }
      }
      lastTap.current = currentTime;
      if (e.touches.length === 0) {
        isMoving.current = false;
      }
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useFrame(({ camera, mouse }) => {
    if (rb.current) {
      const vel = rb.current.linvel();
      const movement = {
        x: 0,
        z: 0,
      };
      const curVel = rb.current.linvel();
      if (get().forward) {
        movement.z = 1;
      }
      if (get().backward) {
        movement.z = -1;
      }

      let speed = get().run ? RUN_SPEED : WALK_SPEED;

      if (isClicking.current) {
        if (mouse.x && mouse.y) {
          // For mouse users
          movement.x = -mouse.x;
          movement.z = mouse.y + 0.4;
        } else if ("ontouchstart" in window) {
          // For touch users
          const touch = event.touches[0]; // Get the first touch
          if (touch) {
            const screenCenterX = window.innerWidth / 2;
            const screenCenterY = window.innerHeight / 2;
            movement.x = (touch.clientX - screenCenterX) / screenCenterX;
            movement.z = (touch.clientY - screenCenterY) / screenCenterY;
          }
        }

        if (Math.abs(movement.x) > 0.5 || Math.abs(movement.z) > 0.5) {
          speed = RUN_SPEED;
        }
      }

      if (get().left) {
        movement.x = 1;
      }
      if (get().right) {
        movement.x = -1;
      }
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
        if (speed === RUN_SPEED) {
          setAnimation("run");
        } else {
          setAnimation("walk");
        }
      } else {
        setAnimation("idle");
      }
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        0.1
      );
      rb.current.setLinvel(vel, true);
    }

    // CAMERA
    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.1
    );
    cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
    camera.position.lerp(cameraWorldPosition.current, 0.1);

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);
      camera.lookAt(cameraLookAt.current);
    }
  });
  return (
    <>
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
          <group ref={character} castShadow receiveShadow>
            <Player position-y={-0.58} animation={animation} />;
          </group>
        </group>
        <CapsuleCollider args={[0.3, 0.54]} position-y={-0.15} />
      </RigidBody>
    </>
  );
};

export default PlayerController;
