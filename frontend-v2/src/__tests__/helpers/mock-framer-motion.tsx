/* eslint-disable react/display-name */
/**
 * Mock for framer-motion in test environment.
 * Provides pass-through components so tests don't need to handle animations.
 */
import React from "react";

const MOTION_PROPS = new Set([
  "animate", "initial", "exit", "transition", "whileHover", "whileTap",
  "whileDrag", "drag", "dragConstraints", "dragElastic", "onDragEnd",
  "onDragStart", "variants", "layout", "layoutId",
]);

export const motion = new Proxy(
  {},
  {
    get: (_target, prop) => {
      return React.forwardRef(
        (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
          const filtered: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(props)) {
            if (!MOTION_PROPS.has(key)) {
              filtered[key] = value;
            }
          }
          return React.createElement(prop as string, { ...filtered, ref });
        },
      );
    },
  },
);

export const AnimatePresence = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;

export const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: () => {},
  on: () => () => {},
});

export const useTransform = () => 0;
export const useAnimation = () => ({ start: async () => {}, stop: () => {} });
