import { vi } from "vitest";

/**
 * Shared framer-motion mock for component tests.
 * Renders motion elements as plain divs and AnimatePresence as a passthrough.
 *
 * Usage: import this file at the top of your test, before component imports.
 * `import "@/__tests__/helpers/mock-framer-motion";`
 */
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      style,
      ...props
    }: React.PropsWithChildren<{
      className?: string;
      style?: React.CSSProperties;
    }>) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));
