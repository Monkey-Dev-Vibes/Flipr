/**
 * Check if the device supports WebAuthn biometric authentication.
 * Returns false if the API is unavailable or the device has no authenticator.
 */
export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Trigger a biometric verification using WebAuthn.
 * This creates a credential challenge that prompts FaceID/TouchID.
 * Returns true if verification succeeds, false otherwise.
 */
export async function requestBiometricVerification(): Promise<boolean> {
  try {
    // Generate a random challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Flipr" },
        user: {
          id: new Uint8Array(16),
          name: "flipr-user",
          displayName: "Flipr User",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 30000,
      },
    });

    return credential !== null;
  } catch {
    return false;
  }
}
