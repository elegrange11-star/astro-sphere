import type { APIRoute } from "astro"
import { getSession } from "../../../lib/auth"
import { getFileSha, putFileBinary } from "../../../lib/github"

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  if (!(await getSession(request, locals))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const formData = await request.formData()
  const file = formData.get("image") as File | null
  if (!file || file.size === 0) {
    return new Response(JSON.stringify({ error: "No image provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const filename = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
  const buffer = await file.arrayBuffer()

  if (!import.meta.env.PROD) {
    const { writeFileSync } = await import(/* @vite-ignore */ "fs")
    writeFileSync(`${process.cwd()}/public/${filename}`, Buffer.from(buffer))
  } else {
    const repoPath = `public/${filename}`
    const sha = await getFileSha(repoPath, locals)
    await putFileBinary(repoPath, buffer, sha, locals)
  }

  return new Response(JSON.stringify({ ok: true, path: `/${filename}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
