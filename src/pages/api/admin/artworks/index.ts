import type { APIRoute } from "astro"
import { getSession } from "../../../../lib/auth"
import { getFile, putFile } from "../../../../lib/github"

export const prerender = false

const ARTWORKS_PATH = "src/data/artworks.json"
const LOCAL_PATH = () => `${process.cwd()}/src/data/artworks.json`

async function readLocal(): Promise<string> {
  const { readFileSync } = await import(/* @vite-ignore */ "fs")
  return readFileSync(LOCAL_PATH(), "utf-8")
}

async function writeLocal(data: unknown): Promise<void> {
  const { writeFileSync } = await import(/* @vite-ignore */ "fs")
  writeFileSync(LOCAL_PATH(), JSON.stringify(data, null, 2))
}

export const GET: APIRoute = async ({ request }) => {
  if (!(await getSession(request))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  if (!import.meta.env.PROD) {
    return new Response(await readLocal(), { status: 200, headers: { "Content-Type": "application/json" } })
  }
  const { content } = await getFile(ARTWORKS_PATH)
  return new Response(content, { status: 200, headers: { "Content-Type": "application/json" } })
}

export const POST: APIRoute = async ({ request }) => {
  if (!(await getSession(request))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  const newArtwork = await request.json()
  if (!import.meta.env.PROD) {
    const data = JSON.parse(await readLocal())
    data.artworks.push(newArtwork)
    await writeLocal(data)
  } else {
    const { content, sha } = await getFile(ARTWORKS_PATH)
    const data = JSON.parse(content)
    data.artworks.push(newArtwork)
    await putFile(ARTWORKS_PATH, JSON.stringify(data, null, 2), sha)
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
