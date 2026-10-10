import { SignJWT, jwtVerify } from "jose"

function getSecret(): Uint8Array {
  const secret = import.meta.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function signToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function getSession(request: Request): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? ""
  const match = cookie.match(/admin_session=([^;]+)/)
  if (!match) return false
  return verifyToken(match[1])
}
