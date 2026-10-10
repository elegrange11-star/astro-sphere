import type { APIRoute } from "astro"
import { getSession } from "../../../lib/auth"
import { getFile, putFile } from "../../../lib/github"
import { readFileSync, writeFileSync } from "fs"

export const prerender = false

const STUDIO_PATH = "src/data/studio.json"
const LOCAL_PATH = () => `${process.cwd()}/src/data/studio.json`

export const GET: APIRoute = async ({ request }) => {
  if (!(await getSession(request))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  if (!import.meta.env.PROD) {
    return new Response(readFileSync(LOCAL_PATH(), "utf-8"), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
  const { content } = await getFile(STUDIO_PATH)
  return new Response(content, { status: 200, headers: { "Content-Type": "application/json" } })
}

export const PUT: APIRoute = async ({ request }) => {
  if (!(await getSession(request))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  const updated = await request.json()
  if (!import.meta.env.PROD) {
    writeFileSync(LOCAL_PATH(), JSON.stringify(updated, null, 2))
  } else {
    const { sha } = await getFile(STUDIO_PATH)
    await putFile(STUDIO_PATH, JSON.stringify(updated, null, 2), sha)
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
