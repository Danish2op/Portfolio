import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { Color, MathUtils, Vector3 } from 'three';

import { usePortfolioStore } from '../../../app/store/usePortfolioStore';
import type { InputMap } from './useInputMap';

const movementSpeed = 8.5;
const verticalLookOffset = new Vector3(0, 2, 0);
const followOffset = new Vector3(0, 7.2, 10.5);
const upAxis = new Vector3(0, 1, 0);
const worldBounds = {
  maxX: 54,
  maxZ: 56,
  minX: -54,
  minZ: -58,
};

export function CharacterController({ input }: { input: InputMap }) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const avatar = useRef<Group>(null);
  const setPlayerPosition = usePortfolioStore((state) => state.setPlayerPosition);
  const lastPublishedPosition = useRef<[number, number, number]>([0, 0, 0]);
  const lookTarget = useMemo(() => new Vector3(), []);
  const desiredCameraPosition = useMemo(() => new Vector3(), []);
  const tempPosition = useMemo(() => new Vector3(), []);
  const tempMovement = useMemo(() => new Vector3(), []);
  const targetPosition = useMemo(() => new Vector3(0, 1.15, 0), []);
  const currentYaw = useRef(0);
  const isInitialized = useRef(false);

  useFrame(({ camera }, delta) => {
    const body = rigidBody.current;

    if (!body) {
      return;
    }

    const translation = body.translation();
    tempPosition.set(translation.x, translation.y, translation.z);

    if (!isInitialized.current) {
      targetPosition.copy(tempPosition);
      isInitialized.current = true;
    }

    const movement = input.getMovementVector();
    tempMovement.set(movement.x, 0, movement.z);

    if (tempMovement.lengthSq() > 0) {
      tempMovement.normalize();
      currentYaw.current = Math.atan2(tempMovement.x, tempMovement.z);
      targetPosition.addScaledVector(tempMovement, movementSpeed * delta);
      targetPosition.x = MathUtils.clamp(
        targetPosition.x,
        worldBounds.minX,
        worldBounds.maxX,
      );
      targetPosition.z = MathUtils.clamp(
        targetPosition.z,
        worldBounds.minZ,
        worldBounds.maxZ,
      );

      body.setRotation(
        {
          x: 0,
          y: Math.sin(currentYaw.current / 2),
          z: 0,
          w: Math.cos(currentYaw.current / 2),
        },
        true,
      );
      if (avatar.current) {
        avatar.current.rotation.y = currentYaw.current;
      }
    }

    body.setNextKinematicTranslation({
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
    });

    tempPosition.lerp(targetPosition, 1 - Math.exp(-MathUtils.clamp(delta, 0, 1) * 18));

    desiredCameraPosition
      .copy(followOffset)
      .applyAxisAngle(upAxis, currentYaw.current)
      .add(tempPosition);

    camera.position.lerp(
      desiredCameraPosition,
      1 - Math.exp(-MathUtils.clamp(delta, 0, 1) * 6),
    );

    lookTarget.copy(tempPosition).add(verticalLookOffset);
    camera.lookAt(lookTarget);

    const nextPublishedPosition: [number, number, number] = [
      Number(tempPosition.x.toFixed(2)),
      Number(tempPosition.y.toFixed(2)),
      Number(tempPosition.z.toFixed(2)),
    ];

    const [lastX, lastY, lastZ] = lastPublishedPosition.current;
    const [nextX, nextY, nextZ] = nextPublishedPosition;

    if (
      Math.abs(nextX - lastX) > 0.2 ||
      Math.abs(nextY - lastY) > 0.2 ||
      Math.abs(nextZ - lastZ) > 0.2
    ) {
      lastPublishedPosition.current = nextPublishedPosition;
      setPlayerPosition(nextPublishedPosition);
    }
  });

  return (
    <RigidBody
      ref={rigidBody}
      canSleep={false}
      colliders={false}
      position={[0, 1.15, 0]}
      type="kinematicPosition"
    >
      <CapsuleCollider args={[0.55, 0.38]} />
      <group ref={avatar}>
        <mesh castShadow position={[0, 1.08, 0]}>
          <capsuleGeometry args={[0.46, 1.4, 10, 18]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.15} roughness={0.28} />
        </mesh>
        <mesh castShadow position={[0, 2.15, 0]}>
          <sphereGeometry args={[0.34, 20, 20]} />
          <meshStandardMaterial color={new Color('#e2e8f0')} />
        </mesh>
        <mesh castShadow position={[0, 1.55, 0.38]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.58, 10]} />
          <meshStandardMaterial color="#f59e0b" emissive="#78350f" />
        </mesh>
        <mesh castShadow position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.58, 0.72, 0.2, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>
    </RigidBody>
  );
}
