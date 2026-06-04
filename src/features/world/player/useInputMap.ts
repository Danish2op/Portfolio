import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef } from 'react';

type Direction = 'backward' | 'forward' | 'left' | 'right';

type MovementVector = {
  x: number;
  z: number;
};

const keyboardDirectionMap: Record<string, Direction> = {
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'forward',
  KeyA: 'left',
  KeyD: 'right',
  KeyS: 'backward',
  KeyW: 'forward',
};

const directionVectors: Record<Direction, MovementVector> = {
  backward: { x: 0, z: 1 },
  forward: { x: 0, z: -1 },
  left: { x: -1, z: 0 },
  right: { x: 1, z: 0 },
};

type DirectionState = Record<Direction, boolean>;

function createDirectionState(): DirectionState {
  return {
    backward: false,
    forward: false,
    left: false,
    right: false,
  };
}

export type InputMap = {
  bindDirection: (
    direction: Direction,
  ) => {
    onPointerCancel: () => void;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
    onPointerUp: () => void;
  };
  getMovementVector: () => MovementVector;
};

export function useInputMap(): InputMap {
  const keyboardState = useRef<DirectionState>(createDirectionState());
  const touchState = useRef<DirectionState>(createDirectionState());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = keyboardDirectionMap[event.code];

      if (!direction) {
        return;
      }

      keyboardState.current[direction] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const direction = keyboardDirectionMap[event.code];

      if (!direction) {
        return;
      }

      keyboardState.current[direction] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return useMemo(() => {
    const setTouchDirection = (direction: Direction, active: boolean) => {
      touchState.current[direction] = active;
    };

    return {
      bindDirection: (direction: Direction) => ({
        onPointerCancel: () => setTouchDirection(direction, false),
        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          setTouchDirection(direction, true);
        },
        onPointerLeave: () => setTouchDirection(direction, false),
        onPointerUp: () => setTouchDirection(direction, false),
      }),
      getMovementVector: () => {
        const state = {
          backward:
            keyboardState.current.backward || touchState.current.backward,
          forward: keyboardState.current.forward || touchState.current.forward,
          left: keyboardState.current.left || touchState.current.left,
          right: keyboardState.current.right || touchState.current.right,
        };

        const vector = (Object.keys(directionVectors) as Direction[]).reduce(
          (result, direction) => {
            if (!state[direction]) {
              return result;
            }

            return {
              x: result.x + directionVectors[direction].x,
              z: result.z + directionVectors[direction].z,
            };
          },
          { x: 0, z: 0 },
        );

        const magnitude = Math.hypot(vector.x, vector.z);

        if (magnitude <= 1) {
          return vector;
        }

        return {
          x: vector.x / magnitude,
          z: vector.z / magnitude,
        };
      },
    };
  }, []);
}
