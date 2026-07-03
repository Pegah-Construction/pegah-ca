import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";

const KEY_LENGTH = 64;

/**
 * Creates a password-reset token. Returns the raw token (emailed to the user,
 * never stored) and its SHA-256 hash (stored in the DB for lookup).
 */
export function createResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Derives a temporary password from a user's name and email, e.g. "Sarah-chen!42". */
export function generatePassword(name: string, email: string): string {
  const firstName = name.trim().split(/\s+/)[0] || "User";
  const base = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
  const localPart = (email.split("@")[0] || "").replace(/[^a-zA-Z0-9]/g, "");
  const suffix = localPart.slice(0, 4) || "user";
  return `${base}-${suffix.toLowerCase()}!`;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = scryptSync(password, salt, KEY_LENGTH);
  return hashBuffer.length === suppliedBuffer.length && timingSafeEqual(hashBuffer, suppliedBuffer);
}
