import type { APIRoute } from "astro"
import { signToken } from "../../../lib/auth"

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.formData()
  const password = body.get("password")?.toString() ?? ""
  const expected =
    (locals as any)?.runtime?.env?.ADMIN_PASSWORD ??
    import.meta.env.ADMIN_PASSWORD

  if (!expected || password !== expected) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const token = await signToken(locals)
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
    },
  })
}
