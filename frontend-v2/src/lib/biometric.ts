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
 * Uses credentials.get() with an empty allowCredentials list to prompt
 * the platform authenticator (FaceID/TouchID) for user verification
 * without requiring a pre-registered credential.
 * Returns true if verification succeeds, false otherwise.
 */
export async function requestBiometricVerification(): Promise<boolean> {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 30000,
      },
    });

    return assertion !== null;
  } catch {
    return false;
  }
}
