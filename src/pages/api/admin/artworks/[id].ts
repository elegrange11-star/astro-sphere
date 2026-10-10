import type { APIRoute } from "astro"
import { getSession } from "../../../../lib/auth"
import { getFile, putFile } from "../../../../lib/github"
import { readFileSync, writeFileSync } from "fs"

export const prerender = false

const ARTWORKS_PATH = "src/data/artworks.json"
const LOCAL_PATH = () => `${process.cwd()}/src/data/artworks.json`

function readLocal() {
  return JSON.parse(readFileSync(LOCAL_PATH(), "utf-8"))
}

function writeLocal(data: unknown) {
  writeFileSync(LOCAL_PATH(), JSON.stringify(data, null, 2))
}

export const PUT: APIRoute = async ({ request, params }) => {
  if (!(await getSession(request))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  const { id } = params
  const updated = await request.json()

  if (!import.meta.env.PROD) {
    const data = readLocal()
    const idx = data.artworks.findIndex((a: { id: string }) => a.id === id)
    if (idx === -1) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    data.artworks[idx] = { ...data.artworks[idx], ...updated }
    writeLocal(data)
  } else {
    const { content, sha } = await getFile(ARTWORKS_PATH)
    const data = JSON.parse(content)
    const idx = data.artworks.findIndex((a: { id: string }) => a.id === id)
    if (idx === -1) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    data.artworks[idx] = { ...data.artworks[idx], ...updated }
    await putFile(ARTWORKS_PATH, JSON.stringify(data, null, 2), sha)
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!(await getSession(request))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  const { id } = params

  if (!import.meta.env.PROD) {
    const data = readLocal()
    data.artworks = data.artworks.filter((a: { id: string }) => a.id !== id)
    writeLocal(data)
  } else {
    const { content, sha } = await getFile(ARTWORKS_PATH)
    const data = JSON.parse(content)
    data.artworks = data.artworks.filter((a: { id: string }) => a.id !== id)
    await putFile(ARTWORKS_PATH, JSON.stringify(data, null, 2), sha)
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
