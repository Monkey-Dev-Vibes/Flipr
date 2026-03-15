"use client";

import { PrivyProvider as PrivySDKProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // Skip Privy in dev auth bypass mode or when no app ID is configured
  if (DEV_AUTH || !PRIVY_APP_ID) {
    return <>{children}</>;
  }

  return (
    <PrivySDKProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#84B500",
          logo: undefined,
        },
        loginMethods: ["apple", "google", "email"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivySDKProvider>
  );
}
