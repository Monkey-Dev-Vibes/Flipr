"use client";

import { PrivyProvider as PrivySDKProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // Skip Privy initialization if no app ID is configured (e.g. during build / SSG)
  if (!PRIVY_APP_ID) {
    return <>{children}</>;
  }

  return (
    <PrivySDKProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#025656",
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
