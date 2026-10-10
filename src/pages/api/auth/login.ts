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
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/login?error=1" },
    })
  }

  const token = await signToken(locals)
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      "Set-Cookie": `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
    },
  })
}
