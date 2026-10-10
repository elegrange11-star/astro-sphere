import { SignJWT, jwtVerify } from "jose"

function getSecret(locals?: App.Locals): Uint8Array {
  const secret =
    (locals as any)?.runtime?.env?.JWT_SECRET ?? import.meta.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function signToken(locals?: App.Locals): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret(locals))
}

export async function verifyToken(
  token: string,
  locals?: App.Locals,
): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret(locals))
    return true
  } catch {
    return false
  }
}

export async function getSession(
  request: Request,
  locals?: App.Locals,
): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? ""
  const match = cookie.match(/admin_session=([^;]+)/)
  if (!match) return false
  return verifyToken(match[1], locals)
}
